from __future__ import annotations

from typing import Any, Dict

from backend.database import get_all_jobs, update_job_scores
from backend.parser import safe_json_loads
from backend.profile import PROFILE, SALARY_BENCHMARKS


SCORING_NOTE = """SCORING METHODOLOGY — Prakhar Bhargava's Job Search Assistant
I evaluate every job opportunity across 5 weighted dimensions, calibrated to my specific career context: a 30-lakh MBA loan, a pivot from political consulting into product/strategy/founders-office roles, and a long-term ambition to build in the social impact space.

Dimension 1 — Zero-to-One Building Potential (30% weight): This is my heaviest weight because every major achievement in my career has come from building systems in undefined environments. I built election prediction models from scratch. I founded a PM club from nothing. I created governance dashboards that got adopted in high-stakes settings. Roles that only maintain existing processes score lower.

Dimension 2 — Impact Visibility & Learning Density (25% weight): I want to see the outcome of my work and learn how a company operates end-to-end. Cross-functional, founder-facing, ownership-heavy roles score highest. Siloed execution roles score low.

Dimension 3 — Company Stage & Trajectory (20% weight): Growth-stage startups score highest because they offer the right balance of chaos and structure. Too early and I risk doing everything without leverage; too late and the most interesting problems may already be solved.

Dimension 4 — Compensation & ROI (15% weight): With a 30-lakh loan, I need 25-30 LPA minimum to make the financial math work, with 30-35 LPA as the target zone. Below 20 LPA is effectively a hard filter unless the role is extraordinary.

Dimension 5 — Profile-Role Fit Probability (10% weight): This is an honest assessment of how my unusual background maps to the job. Founders office, strategy, and operations roles value my cross-domain execution history more than narrow, domain-pure PM jobs with strict pedigree requirements.

Two bonus modifiers: +5 for AI-focused companies or roles and +0 to +5 for freshness, because early application advantage matters.

What I excluded and why: work-life balance as a direct scoring dimension, company brand name as a standalone factor, and narrow industry preference. At this stage, role quality, learning density, and ROI matter more."""


def normalize_weights(weights: Dict[str, float] | None) -> Dict[str, float]:
    if weights is None:
        return PROFILE["scoring_weights"]
    total = sum(weights.values()) or 1.0
    return {key: value / total for key, value in weights.items()}


def estimate_salary(role_type: str, company_stage: str) -> float:
    base = SALARY_BENCHMARKS.get(role_type, {}).get("median", 18)
    stage_multipliers = {
        "series_c_plus": 1.4,
        "pre_ipo": 1.5,
        "series_b": 1.2,
        "series_a": 0.9,
        "mnc": 1.1,
        "seed": 0.7,
        "public": 1.3,
        "unknown": 1.0,
    }
    return round(base * stage_multipliers.get(company_stage or "unknown", 1.0), 1)


def score_from_salary(salary_lpa: float) -> float:
    if salary_lpa >= 35:
        return 100
    if salary_lpa >= 30:
        return 90
    if salary_lpa >= 25:
        return 75
    if salary_lpa >= 20:
        return 55
    if salary_lpa >= 15:
        return 30
    if salary_lpa >= 12:
        return 15
    return 5


def score_zero_to_one(job: Dict[str, Any]) -> tuple[float, str]:
    title = (job.get("title") or "").lower()
    desc = (job.get("description") or "").lower()
    role_type = job.get("role_type") or "other"
    base_scores = {
        "founders_office": 100,
        "strategy": 85,
        "growth": 80,
        "product": 70,
        "ai_product": 75,
        "consulting": 45,
        "vc": 45,
        "other": 40,
    }
    score = base_scores.get(role_type, 40)
    reasons = [f"Role type '{role_type}' base: {score}"]
    positive = [
        "build from scratch",
        "first hire",
        "undefined scope",
        "0 to 1",
        "zero to one",
        "greenfield",
        "founding team",
        "build the function",
        "create the playbook",
        "ambiguity",
        "entrepreneurial",
        "wear many hats",
    ]
    matches = [keyword for keyword in positive if keyword in desc]
    if matches:
        boost = min(len(matches) * 5, 20)
        score += boost
        reasons.append(f"0-to-1 signals: {matches[:3]} (+{boost})")
    negative = ["support the team", "maintain existing", "contribute to reports", "bau", "assist with"]
    neg_matches = [keyword for keyword in negative if keyword in desc]
    if neg_matches:
        penalty = min(len(neg_matches) * 8, 25)
        score -= penalty
        reasons.append(f"Maintenance signals: {neg_matches[:3]} (-{penalty})")
    if any(keyword in title for keyword in ["chief of staff", "founder", "eir", "head", "lead"]):
        score += 10
        reasons.append("Leadership title signal (+10)")
    return max(min(score, 100), 10), " | ".join(reasons)


def score_impact_learning(job: Dict[str, Any]) -> tuple[float, str]:
    desc = (job.get("description") or "").lower()
    score = 50
    reasons = []
    cross_functional = [
        "cross-functional",
        "work with ceo",
        "work with founder",
        "report to ceo",
        "report to founder",
        "board",
        "investor",
        "fundraising",
        "gtm",
        "end-to-end",
        "p&l",
        "revenue",
        "multiple functions",
    ]
    matches = [keyword for keyword in cross_functional if keyword in desc]
    if matches:
        boost = min(len(matches) * 6, 28)
        score += boost
        reasons.append(f"Cross-functional exposure: {matches[:3]} (+{boost})")
    impact = ["ownership", "directly responsible", "own the", "drive", "lead", "accountable", "kpi", "okr"]
    impact_matches = [keyword for keyword in impact if keyword in desc]
    if impact_matches:
        boost = min(len(impact_matches) * 5, 20)
        score += boost
        reasons.append(f"Ownership signals: {impact_matches[:3]} (+{boost})")
    domains = sum(1 for token in ["product", "marketing", "sales", "operations", "finance", "engineering", "data", "strategy"] if token in desc)
    if domains >= 4:
        score += 15
        reasons.append(f"High learning density across {domains} functions (+15)")
    elif domains >= 2:
        score += 8
        reasons.append(f"Moderate learning density across {domains} functions (+8)")
    if any(keyword in desc for keyword in ["reporting only", "single function", "support role", "back office only"]):
        score -= 20
        reasons.append("Siloed role signals (-20)")
    return max(min(score, 100), 10), " | ".join(reasons) if reasons else "Default learning score"


def score_company_stage(job: Dict[str, Any]) -> tuple[float, str]:
    stage = job.get("company_stage") or "unknown"
    glassdoor = job.get("company_glassdoor_rating")
    is_ai = bool(job.get("company_is_ai"))
    yc_backed = bool(job.get("company_yc_backed"))
    stage_scores = {
        "series_b": 100,
        "series_c_plus": 95,
        "pre_ipo": 80,
        "series_a": 65,
        "mnc": 50,
        "seed": 40,
        "public": 45,
        "unknown": 50,
    }
    score = stage_scores.get(stage, 50)
    reasons = [f"Company stage '{stage}': {score}"]
    if glassdoor:
        if glassdoor >= 4.0:
            score += 10
            reasons.append(f"Glassdoor {glassdoor} (+10)")
        elif glassdoor < 3.0:
            score -= 15
            reasons.append(f"Glassdoor {glassdoor} (-15)")
    if is_ai:
        score += 10
        reasons.append("AI company (+10)")
    if yc_backed:
        score += 10
        reasons.append("YC-backed company (+10)")
    return max(min(score, 100), 10), " | ".join(reasons)


def score_compensation(job: Dict[str, Any]) -> tuple[float, str]:
    min_sal = job.get("salary_min_lpa")
    max_sal = job.get("salary_max_lpa")
    role_type = job.get("role_type") or "other"
    stage = job.get("company_stage") or "unknown"
    if min_sal is None and max_sal is None:
        estimated = estimate_salary(role_type, stage)
        return score_from_salary(estimated), f"Salary not listed. Estimated ~₹{estimated:.0f}L for {role_type} at {stage}"
    if min_sal and max_sal:
        salary = (float(min_sal) + float(max_sal)) / 2
    else:
        salary = float(max_sal or min_sal or 0)
    return score_from_salary(salary), f"Salary midpoint ~₹{salary:.0f}L"


def score_profile_fit(job: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, str]:
    desc = (job.get("description") or "").lower()
    required = {skill.lower() for skill in safe_json_loads(job.get("skills_required"))}
    my_skills = {skill.lower() for skill in profile["hard_skills"] + profile["business_skills"]}
    reasons = []
    if required:
        matched = required.intersection(my_skills)
        match_pct = len(matched) / len(required) * 100
        score = min(match_pct, 100)
        reasons.append(f"Skill match {len(matched)}/{len(required)} ({match_pct:.0f}%)")
    else:
        score = 55
        reasons.append("No structured required skills extracted; neutral fit baseline")
    exp_min = job.get("experience_min") or 0
    exp_max = job.get("experience_max") or 99
    my_exp = profile["total_experience_years"]
    if exp_min <= my_exp <= exp_max:
        score += 15
        reasons.append(f"Experience fit: {my_exp}y within {exp_min}-{exp_max} (+15)")
    elif my_exp < exp_min:
        gap = exp_min - my_exp
        penalty = min(gap * 10, 30)
        score -= penalty
        reasons.append(f"Experience gap of {gap:.1f}y (-{penalty:.0f})")
    strengths = [
        "problem solving",
        "stakeholder",
        "ambiguity",
        "cross-functional",
        "data-driven",
        "analytics",
        "team management",
        "system",
        "build from scratch",
        "startup",
    ]
    strength_matches = [keyword for keyword in strengths if keyword in desc]
    if strength_matches:
        boost = min(len(strength_matches) * 4, 20)
        score += boost
        reasons.append(f"Strength alignment: {strength_matches[:3]} (+{boost})")
    location_score = job.get("location_match_score")
    if location_score is not None:
        if location_score >= 90:
            score += 10
            reasons.append("Preferred location (+10)")
        elif location_score < 60:
            score -= 10
            reasons.append("Location mismatch (-10)")
    if any(keyword in desc for keyword in ["must have 5 years", "mandatory experience in saas", "minimum 4 years in"]):
        score -= 15
        reasons.append("Strict domain/experience requirement (-15)")
    return max(min(score, 100), 10), " | ".join(reasons)


def score_ai_bonus(job: Dict[str, Any]) -> float:
    desc = (job.get("description") or "").lower()
    title = (job.get("title") or "").lower()
    if job.get("company_is_ai"):
        return 5.0
    signals = ["artificial intelligence", "machine learning", "llm", "gpt", "agentic", "generative ai", "ai product"]
    if any(signal in desc or signal in title for signal in signals):
        return 5.0
    return 0.0


def score_freshness(job: Dict[str, Any]) -> float:
    days = job.get("days_since_posted")
    posting_date = (job.get("posting_date") or "").lower()
    if days is not None:
        if days <= 0:
            return 5.0
        if days == 1:
            return 4.0
        if days <= 3:
            return 3.0
        if days <= 7:
            return 1.0
        return 0.0
    if posting_date in {"today", "just now", "few hours ago"}:
        return 5.0
    if "1 day" in posting_date or "yesterday" in posting_date:
        return 4.0
    return 2.0


def score_job(job: Dict[str, Any], weights: Dict[str, float] | None = None) -> Dict[str, Any]:
    weights_used = normalize_weights(weights)
    s1, r1 = score_zero_to_one(job)
    s2, r2 = score_impact_learning(job)
    s3, r3 = score_company_stage(job)
    s4, r4 = score_compensation(job)
    s5, r5 = score_profile_fit(job, PROFILE)
    ai_bonus = score_ai_bonus(job)
    freshness_bonus = score_freshness(job)
    total = (
        s1 * weights_used.get("zero_to_one", 0.30)
        + s2 * weights_used.get("impact_learning", 0.25)
        + s3 * weights_used.get("company_stage", 0.20)
        + s4 * weights_used.get("compensation", 0.15)
        + s5 * weights_used.get("profile_fit", 0.10)
        + ai_bonus
        + freshness_bonus
    )
    total = min(round(total, 1), 100)
    return {
        "total": total,
        "weights_used": weights_used,
        "dimensions": {
            "zero_to_one": {"score": s1, "weight": f"{weights_used.get('zero_to_one', 0.30) * 100:.0f}%", "weighted": round(s1 * weights_used.get("zero_to_one", 0.30), 1), "reason": r1},
            "impact_learning": {"score": s2, "weight": f"{weights_used.get('impact_learning', 0.25) * 100:.0f}%", "weighted": round(s2 * weights_used.get("impact_learning", 0.25), 1), "reason": r2},
            "company_stage": {"score": s3, "weight": f"{weights_used.get('company_stage', 0.20) * 100:.0f}%", "weighted": round(s3 * weights_used.get("company_stage", 0.20), 1), "reason": r3},
            "compensation": {"score": s4, "weight": f"{weights_used.get('compensation', 0.15) * 100:.0f}%", "weighted": round(s4 * weights_used.get("compensation", 0.15), 1), "reason": r4},
            "profile_fit": {"score": s5, "weight": f"{weights_used.get('profile_fit', 0.10) * 100:.0f}%", "weighted": round(s5 * weights_used.get("profile_fit", 0.10), 1), "reason": r5},
        },
        "bonuses": {"ai_bonus": ai_bonus, "freshness_bonus": freshness_bonus},
    }


def score_all_jobs(weights: Dict[str, float] | None = None) -> list[Dict[str, Any]]:
    jobs = get_all_jobs()
    results = []
    for job in jobs:
        breakdown = score_job(job, weights)
        update_job_scores(job["id"], breakdown)
        results.append(
            {
                "job_id": job["id"],
                "title": job["title"],
                "company": job["company"],
                "score": breakdown["total"],
                "breakdown": breakdown,
            }
        )
    results.sort(key=lambda item: item["score"], reverse=True)
    return results
