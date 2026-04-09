from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

TIER_WEIGHT = {
    1: 2.2,
    2: 1.8,
    3: 1.4,
    4: 1.0,
    5: 0.7,
}

STATE_NAMES = {
    "andhra pradesh",
    "arunachal pradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachal pradesh",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhya pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil nadu",
    "telangana",
    "tripura",
    "uttar pradesh",
    "uttarakhand",
    "west bengal",
    "delhi",
    "jammu and kashmir",
    "ladakh",
}


def load_source_packets(sources_dir: str | Path) -> list[dict[str, Any]]:
    """Load schema-like source packets from a directory of JSON files."""
    directory = Path(sources_dir)
    packets = []
    for path in sorted(directory.glob("*.json")):
        with path.open(encoding="utf-8") as handle:
            packet = json.load(handle)
        packet["_path"] = str(path)
        packets.append(packet)
    if not packets:
        raise FileNotFoundError(f"No JSON source packets found in {directory}")
    return packets


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]{3,}", text.lower())


def split_sentences(text: str) -> list[str]:
    pieces = re.split(r"(?<=[.!?])\s+", text.strip())
    return [piece.strip() for piece in pieces if piece.strip()]


def flatten_packet_text(packet: dict[str, Any]) -> str:
    parts = [
        packet.get("title", ""),
        packet.get("summary", ""),
        " ".join(packet.get("key_claims", [])),
        " ".join(packet.get("quote_snippets", [])),
        " ".join(
            f"{fact.get('label', '')} {fact.get('value', '')} {fact.get('unit', '')} {fact.get('context', '')}"
            for fact in packet.get("numeric_facts", [])
        ),
        packet.get("extraction_notes", ""),
    ]
    return "\n".join(part for part in parts if part)


def source_relevance_score(packet: dict[str, Any], policy_question: str) -> float:
    query_terms = tokenize(policy_question)
    corpus = flatten_packet_text(packet).lower()
    matches = sum(corpus.count(term) for term in query_terms)
    tier_weight = TIER_WEIGHT.get(packet.get("source_tier", 5), 0.5)
    numeric_bonus = min(len(packet.get("numeric_facts", [])) * 0.15, 0.75)
    return matches * tier_weight + numeric_bonus


def retrieve_packets(
    packets: list[dict[str, Any]],
    policy_question: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    ranked = sorted(
        packets,
        key=lambda packet: (
            source_relevance_score(packet, policy_question),
            -packet.get("source_tier", 5),
            packet.get("published_at", ""),
        ),
        reverse=True,
    )
    return ranked[:top_k]


def mode_string(values: list[str], default: str = "Unknown") -> str:
    cleaned = [value for value in values if value and value != "Unknown"]
    if not cleaned:
        return default
    return Counter(cleaned).most_common(1)[0][0]


def first_match(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return match.group(1).strip() if match else None


def confidence_from_packets(packets: list[dict[str, Any]]) -> tuple[str, int]:
    if not packets:
        return "LOW", 30
    tiers = [packet.get("source_tier", 5) for packet in packets]
    score = 50
    if any(tier == 1 for tier in tiers):
        score += 20
    if sum(1 for tier in tiers if tier <= 2) >= 2:
        score += 15
    if any(packet.get("numeric_facts") for packet in packets):
        score += 10
    if any(packet.get("source_tier", 5) == 5 for packet in packets):
        score -= 5
    score = max(0, min(score, 100))
    if score >= 85:
        return "HIGH", score
    if score >= 60:
        return "MEDIUM", score
    return "LOW", score


def build_source_register(packets: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique = []
    seen = set()
    for packet in sorted(packets, key=lambda item: (item.get("source_tier", 5), item.get("title", ""))):
        key = (packet.get("title"), packet.get("url"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(
            {
                "tier": packet.get("source_tier", 5),
                "name": packet.get("title", "Unknown"),
                "url_or_reference": packet.get("url", packet.get("_path", "Unknown")),
            }
        )
    return unique


def baseline_rows(packets: list[dict[str, Any]]) -> list[dict[str, str]]:
    rows = []
    for packet in packets:
        for fact in packet.get("numeric_facts", [])[:4]:
            rows.append(
                {
                    "source": packet.get("title", "Unknown"),
                    "label": fact.get("label", "Unknown"),
                    "value": fact.get("value", "Unknown"),
                    "unit": fact.get("unit", ""),
                    "context": fact.get("context", ""),
                }
            )
    return rows[:8]


def select_field_packets(packets: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [packet for packet in packets if packet.get("source_tier") == 5]


def compact_summary(packet: dict[str, Any], max_sentences: int = 2) -> str:
    sentences = split_sentences(packet.get("summary", "")) or split_sentences(flatten_packet_text(packet))
    return " ".join(sentences[:max_sentences]).strip()


def detect_failure_modes(text: str) -> list[str]:
    failures = []
    lowered = text.lower()
    if any(word in lowered for word in ("coverage", "excluded", "marginalized", "rural", "elderly", "women")):
        failures.append("equity failure for hard-to-reach or vulnerable groups")
    if any(word in lowered for word in ("claims", "fraud", "portal", "delay", "governance", "enforcement")):
        failures.append("government failure driven by delivery, oversight, or claims-management gaps")
    if any(word in lowered for word in ("insurance", "provider", "private hospital", "information asymmetry")):
        failures.append("market failure linked to provider incentives and information asymmetry")
    return failures or ["mixed state-capacity and equity failure"]


def detect_bottleneck(packets: list[dict[str, Any]]) -> str:
    joined = " ".join(flatten_packet_text(packet) for packet in packets).lower()
    options = [
        ("beneficiary awareness and card activation remain uneven", ("awareness", "card", "activation")),
        ("claims processing and hospital reimbursement discipline remain uneven", ("claim", "reimbursement", "settlement")),
        ("state-level implementation capacity is inconsistent", ("state", "capacity", "implementation")),
        ("data quality and beneficiary verification remain weak", ("data", "verification", "secc")),
    ]
    for label, terms in options:
        if all(term in joined for term in terms):
            return label
    for label, terms in options:
        if any(term in joined for term in terms):
            return label
    return "implementation bottlenecks are visible, but sample evidence is still limited"


def detect_primary_group(policy_question: str, packets: list[dict[str, Any]]) -> str:
    joined = " ".join([policy_question] + [flatten_packet_text(packet) for packet in packets])
    for pattern in (
        r"(senior citizens aged 70[^.,;]*)",
        r"(women and children[^.,;]*)",
        r"(deprived families[^.,;]*)",
        r"(beneficiaries[^.,;]*)",
    ):
        match = first_match(pattern, joined)
        if match:
            return match
    return "Intended beneficiaries not cleanly extractable from current evidence"


def detect_estimated_count(packets: list[dict[str, Any]]) -> str:
    for packet in packets:
        for fact in packet.get("numeric_facts", []):
            label = fact.get("label", "").lower()
            if any(token in label for token in ("beneficiary", "famil", "citizen", "people", "household")):
                return " ".join(
                    item
                    for item in (fact.get("value", "").strip(), fact.get("unit", "").strip())
                    if item
                )
    return "Unknown"


def detect_launch_year(packets: list[dict[str, Any]]) -> int | None:
    years = []
    for packet in packets:
        text = flatten_packet_text(packet)
        for match in re.findall(r"\b(20[0-3][0-9])\b", text):
            years.append(int(match))
    return min(years) if years else None


def detect_fiscal_value(packets: list[dict[str, Any]], label_keywords: tuple[str, ...]) -> str:
    for packet in packets:
        for fact in packet.get("numeric_facts", []):
            label = fact.get("label", "").lower()
            if any(keyword in label for keyword in label_keywords):
                return " ".join(
                    item
                    for item in (fact.get("value", "").strip(), fact.get("unit", "").strip())
                    if item
                ) or "Unknown"
    return "Unknown"


def extract_states_lagging(packets: list[dict[str, Any]]) -> list[str]:
    joined = " ".join(flatten_packet_text(packet) for packet in packets).lower()
    found = []
    for state in sorted(STATE_NAMES):
        if state in joined and any(
            cue in joined for cue in ("lag", "slow", "weak", "uneven", "delayed", "underperform")
        ):
            found.append(state.title())
    return found[:5]


def build_stakeholder_map(
    ministry_owner: str,
    packets: list[dict[str, Any]],
    primary_group: str,
) -> list[dict[str, str]]:
    joined = " ".join(flatten_packet_text(packet) for packet in packets).lower()
    stakeholders = [
        {
            "name": ministry_owner,
            "role": "Lead policy owner and national scheme steward",
            "friction_or_alignment": "Aligned on policy expansion, but dependent on state execution",
        },
        {
            "name": "State implementing agencies",
            "role": "Enrollment, claims oversight, and provider management",
            "friction_or_alignment": "Execution quality varies across states and drives outcomes",
        },
    ]
    if "hospital" in joined or "provider" in joined:
        stakeholders.append(
            {
                "name": "Empanelled hospitals",
                "role": "Deliver covered services and submit claims",
                "friction_or_alignment": "Aligned when reimbursement is predictable; friction rises when claims are delayed",
            }
        )
    if "asha" in joined or "anganwadi" in joined or "community" in joined:
        stakeholders.append(
            {
                "name": "Frontline workers and community intermediaries",
                "role": "Last-mile awareness, grievance surfacing, and beneficiary support",
                "friction_or_alignment": "Often aligned with citizen outcomes but under-supported operationally",
            }
        )
    stakeholders.append(
        {
            "name": primary_group,
            "role": "Primary intended beneficiaries",
            "friction_or_alignment": "Alignment is high, but access depends on awareness and administrative ease",
        }
    )
    return stakeholders


def build_recommendations(
    ministry_owner: str,
    bottleneck: str,
    field_packets: list[dict[str, Any]],
    confidence: str,
) -> list[dict[str, str]]:
    recommendations = [
        {
            "action": "Publish a monthly dashboard on enrollment, utilization, claims turnaround, and denial rates.",
            "lead_agency": ministry_owner,
            "rationale": "A stable operating view helps distinguish announcement momentum from delivery momentum.",
            "confidence": confidence,
            "timeline": "0-3 months",
        },
        {
            "action": "Create a state support plan focused on the weakest implementation bottleneck.",
            "lead_agency": "National health authority and state implementing agencies",
            "rationale": f"The retrieved evidence points to {bottleneck}.",
            "confidence": confidence,
            "timeline": "3-6 months",
        },
    ]
    if field_packets:
        recommendations.append(
            {
                "action": "Fund structured beneficiary outreach through frontline networks before major scale-up.",
                "lead_agency": "State health agencies with district health teams",
                "rationale": "Field signals suggest last-mile awareness and activation frictions that money alone will not solve.",
                "confidence": "MEDIUM" if confidence == "HIGH" else confidence,
                "timeline": "0-6 months",
            }
        )
    else:
        recommendations.append(
            {
                "action": "Commission a rapid field validation loop in districts before allocating additional catalytic capital.",
                "lead_agency": "Lead ministry with evaluation partners",
                "rationale": "The current evidence base is strong on policy design but thinner on ground-truth implementation.",
                "confidence": "MEDIUM",
                "timeline": "0-3 months",
            }
        )
    return recommendations


def generate_policy_brief(
    policy_name: str,
    policy_question: str,
    packets: list[dict[str, Any]],
) -> dict[str, Any]:
    selected = retrieve_packets(packets, policy_question)
    confidence_label, confidence_score = confidence_from_packets(selected)
    ministry_owner = mode_string([packet.get("ministry_owner", "Unknown") for packet in selected])
    sector = mode_string([packet.get("sector", "Unknown") for packet in selected])
    jurisdiction = mode_string([packet.get("jurisdiction", "Unknown") for packet in selected], default="India")
    primary_group = detect_primary_group(policy_question, selected)
    field_packets = select_field_packets(selected)
    bottleneck = detect_bottleneck(selected)
    context_blurbs = [compact_summary(packet) for packet in selected[:2] if compact_summary(packet)]
    combined_text = " ".join(flatten_packet_text(packet) for packet in selected)
    failures = detect_failure_modes(combined_text)

    one_line_verdict = (
        f"{policy_name} shows credible policy intent, but the retrieved evidence suggests that "
        f"delivery quality will hinge on state capacity, provider incentives, and last-mile awareness. "
        f"[ANALYSIS - {confidence_label} CONFIDENCE]"
    )

    baseline = baseline_rows(selected)
    if baseline:
        baseline_summary = (
            "The MVP exposes numeric signals from retrieved sources, but a full BE/RE/Actual comparison "
            "still requires dedicated budget tables in the source packets."
        )
    else:
        baseline_summary = "No defensible budget baseline was extractable from the current source packets."

    structural_diagnosis = (
        f"The dominant problem shape is {'; '.join(failures)}. "
        f"In this evidence set, the policy objective sits in the {sector.lower()} domain and requires "
        f"coordination across national stewardship, state execution, and beneficiary-facing delivery systems. "
        f"[ANALYSIS - {confidence_label} CONFIDENCE]"
    )

    implementation_reality = (
        f"The strongest implementation concern is that {bottleneck}. "
        f"Tiered evidence from {jurisdiction} points to uneven operational capacity rather than a purely conceptual design failure. "
        f"[ANALYSIS - {confidence_label} CONFIDENCE]"
    )

    if baseline:
        fiscal_view = (
            "The retrieved packets contain numeric signals that should guide capital allocation, but they do not yet provide "
            "a complete expenditure baseline. The near-term priority is to direct additional public or catalytic capital only "
            "into states or delivery chains that can absorb it while fixing visible bottlenecks first. "
            f"[ANALYSIS - {confidence_label} CONFIDENCE]"
        )
    else:
        fiscal_view = (
            "The MVP can flag the need for budget scrutiny, but the current packet set is still too thin for a hard allocation call. "
            "The safer recommendation is to pair any funding decision with stronger utilization, claims, and service-delivery data. "
            "[ANALYSIS - MEDIUM CONFIDENCE]"
        )

    if field_packets:
        field_intelligence = " ".join(
            f"[FIELD SIGNAL - LOW CONFIDENCE | {packet.get('title', 'Unknown source')}] {compact_summary(packet, 1)}"
            for packet in field_packets
        )
    else:
        field_intelligence = "No direct field signals were present in the retrieved packet set."

    source_register = build_source_register(selected)
    stakeholder_map = build_stakeholder_map(ministry_owner, selected, primary_group)
    recommendations = build_recommendations(ministry_owner, bottleneck, field_packets, confidence_label)

    return {
        "policy_name": policy_name,
        "policy_question": policy_question,
        "one_line_verdict": one_line_verdict,
        "verdict_confidence": confidence_label,
        "context": " ".join(context_blurbs)
        or "Data not available in retrieved material.",
        "baseline_comparison": {
            "summary": baseline_summary,
            "rows": baseline,
        },
        "structural_diagnosis": structural_diagnosis,
        "stakeholder_map": stakeholder_map,
        "implementation_reality": implementation_reality,
        "fiscal_and_capital_allocation_view": fiscal_view,
        "field_intelligence": field_intelligence,
        "recommendations": recommendations,
        "source_register": source_register,
        "_confidence_score": confidence_score,
    }


def generate_policy_extraction(
    policy_name: str,
    packets: list[dict[str, Any]],
    policy_question: str = "",
) -> dict[str, Any]:
    selected = retrieve_packets(packets, policy_question or policy_name)
    confidence_label, confidence_score = confidence_from_packets(selected)
    ministry_owner = mode_string([packet.get("ministry_owner", "Unknown") for packet in selected])
    sector = mode_string([packet.get("sector", "Unknown") for packet in selected])
    jurisdiction = mode_string([packet.get("jurisdiction", "Unknown") for packet in selected], default="India")
    primary_group = detect_primary_group(policy_question or policy_name, selected)
    bottleneck = detect_bottleneck(selected)
    recommendations = build_recommendations(
        ministry_owner,
        bottleneck,
        select_field_packets(selected),
        confidence_label,
    )
    stakeholders = []
    for stakeholder in build_stakeholder_map(ministry_owner, selected, primary_group):
        text = stakeholder["friction_or_alignment"].lower()
        stakeholders.append(
            {
                "name": stakeholder["name"],
                "role": stakeholder["role"],
                "incentive_alignment": stakeholder["friction_or_alignment"],
                "friction_flag": any(word in text for word in ("friction", "delay", "vary", "uneven", "weak")),
            }
        )

    positive = compact_summary(selected[0]) if selected else "Unknown"
    negative = (
        f"Delivery risk remains high because {bottleneck}."
        if selected
        else "Unknown"
    )

    top_recommendation = recommendations[0]
    return {
        "policy_name": policy_name,
        "ministry_owner": ministry_owner,
        "launch_year": detect_launch_year(selected),
        "sector": sector,
        "target_beneficiaries": {
            "primary_group": primary_group,
            "estimated_count": detect_estimated_count(selected),
            "geographic_focus": jurisdiction,
        },
        "stakeholders": stakeholders,
        "fiscal_data": {
            "unit_assistance": detect_fiscal_value(selected, ("cover", "assistance", "benefit")),
            "centre_state_ratio": detect_fiscal_value(selected, ("ratio", "share")),
            "annual_budget_cr": detect_fiscal_value(selected, ("budget", "allocation", "outlay")),
        },
        "implementation_status": {
            "overall_progress": (
                "Policy intent is documented and implementation is underway in the retrieved evidence."
                if selected
                else "Unknown"
            ),
            "top_bottleneck": bottleneck,
            "states_lagging": extract_states_lagging(selected),
        },
        "impact_summary": {
            "positive": positive or "Unknown",
            "negative": negative,
            "confidence_level": confidence_label,
        },
        "sentiment": {
            "government_framing": "Positions the policy as a coverage and delivery expansion.",
            "opposition_framing": "Likely to focus on implementation gaps and adequacy of delivery financing.",
            "media_dominant_tone": "Mixed; supportive of intent but attentive to execution quality.",
            "citizen_perception": "Likely positive when benefits are easy to access, but sensitive to last-mile friction.",
        },
        "top_recommendation": {
            "action": top_recommendation["action"],
            "lead_agency": top_recommendation["lead_agency"],
            "confidence_score": confidence_score,
            "timeline": top_recommendation["timeline"],
        },
        "sources": build_source_register(selected),
    }


def render_markdown_brief(brief: dict[str, Any]) -> str:
    lines = [
        f"# {brief['policy_name']}",
        "",
        "## ONE-LINE VERDICT",
        brief["one_line_verdict"],
        "",
        "## CONTEXT",
        brief["context"],
        "",
        "## BASELINE COMPARISON",
        brief["baseline_comparison"]["summary"],
        "",
    ]
    rows = brief["baseline_comparison"]["rows"]
    if rows:
        headers = list(rows[0].keys())
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("| " + " | ".join("---" for _ in headers) + " |")
        for row in rows:
            lines.append("| " + " | ".join(str(row.get(header, "")) for header in headers) + " |")
        lines.append("")
    lines.extend(
        [
            "## STRUCTURAL DIAGNOSIS",
            brief["structural_diagnosis"],
            "",
            "## STAKEHOLDER MAP",
        ]
    )
    for stakeholder in brief["stakeholder_map"]:
        lines.append(
            f"- **{stakeholder['name']}**: {stakeholder['role']} ({stakeholder['friction_or_alignment']})"
        )
    lines.extend(
        [
            "",
            "## IMPLEMENTATION REALITY",
            brief["implementation_reality"],
            "",
            "## FISCAL AND CAPITAL ALLOCATION VIEW",
            brief["fiscal_and_capital_allocation_view"],
            "",
            "## FIELD INTELLIGENCE",
            brief["field_intelligence"],
            "",
            "## RECOMMENDATIONS",
        ]
    )
    for index, recommendation in enumerate(brief["recommendations"], start=1):
        lines.extend(
            [
                f"{index}. **Action:** {recommendation['action']}",
                f"   - Lead agency: {recommendation['lead_agency']}",
                f"   - Rationale: {recommendation['rationale']}",
                f"   - Confidence: {recommendation['confidence']}",
                f"   - Timeline: {recommendation['timeline']}",
            ]
        )
    lines.extend(["", "## SOURCE REGISTER"])
    for source in brief["source_register"]:
        lines.append(f"- Tier {source['tier']}: {source['name']} ({source['url_or_reference']})")
    return "\n".join(lines).strip() + "\n"


def write_json(path: str | Path, payload: dict[str, Any]) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)
        handle.write("\n")


def write_text(path: str | Path, payload: str) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(payload, encoding="utf-8")


def utc_timestamp() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
