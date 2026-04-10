import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any, Dict, Iterable, Tuple

from backend.profile import PROFILE


SKILL_VARIANTS = {
    "SQL": ["sql", "mysql", "postgresql", "bigquery", "redshift", "sql server", "sql queries"],
    "Python": ["python", "pandas", "numpy", "scikit-learn", "flask", "django", "pytorch"],
    "Excel": ["excel", "pivot tables", "vlookup", "advanced excel", "google sheets", "macros"],
    "Data Visualization": ["data visualization", "tableau", "power bi", "looker", "dashboard", "reporting"],
    "Machine Learning": ["machine learning", "ml", "deep learning", "model training", "classification", "regression", "nlp"],
    "AI/Automation": ["ai", "artificial intelligence", "automation", "llm", "gpt", "chatbot", "generative ai", "agentic ai", "langchain"],
    "Product Management": ["product management", "product manager", "roadmap", "prd", "user stories", "product strategy", "backlog"],
    "Stakeholder Management": ["stakeholder", "cross-functional", "executive communication", "alignment", "collaboration", "c-suite"],
    "Market Research": ["market research", "competitive analysis", "market sizing", "tam sam som", "user research", "customer insights"],
    "GTM Strategy": ["go-to-market", "gtm", "launch strategy", "market entry", "growth strategy", "market expansion"],
    "Strategy": ["strategy", "strategic planning", "business strategy", "corporate strategy", "problem solving", "structured thinking"],
    "Wireframing/Design": ["wireframe", "figma", "prototype", "mockup", "ui/ux", "design thinking"],
    "A/B Testing": ["a/b testing", "experimentation", "experiment design", "hypothesis testing"],
    "Analytics": ["analytics", "google analytics", "mixpanel", "amplitude", "segment", "data analysis", "business analytics", "data-driven"],
    "SEO/SEM": ["seo", "sem", "google ads", "paid marketing", "performance marketing", "digital marketing"],
    "Project Management": ["project management", "program management", "delivery management", "agile", "scrum", "jira"],
    "Communication": ["communication", "presentation", "storytelling", "narrative", "writing", "public speaking"],
    "Operations": ["operations", "ops", "process optimization", "supply chain", "logistics", "efficiency", "operational excellence"],
    "Growth": ["growth", "user acquisition", "retention", "activation", "funnel optimization", "growth loops"],
    "Investor Relations": ["investor relations", "fundraising", "pitch deck", "board reporting", "venture capital", "due diligence"],
    "Team Leadership": ["team management", "people management", "hiring", "team building", "mentoring", "leadership"],
    "Client Management": ["client management", "account management", "client relations", "customer success", "client engagement"],
    "CRM": ["salesforce", "hubspot", "crm", "zoho crm", "pipeline management"],
    "Financial Analysis": ["financial analysis", "financial modeling", "p&l", "budgeting", "forecasting", "unit economics", "revenue modeling"],
}

ROLE_CLASSIFIERS = {
    "founders_office": ["founder's office", "founders office", "chief of staff", "eir", "entrepreneur in residence", "ceo office", "office of ceo"],
    "strategy": ["strategy", "strategic", "business operations", "biz ops", "strategy & operations", "corporate strategy", "strategy associate", "strategy manager"],
    "product": ["product manager", "product management", "apm", "associate product manager", "product lead", "product owner"],
    "growth": ["growth", "growth manager", "growth lead", "user acquisition", "revenue growth"],
    "ai_product": ["ai product", "ml product", "ai/ml", "generative ai", "machine learning product", "llm"],
    "consulting": ["consultant", "consulting", "advisory", "analyst"],
    "vc": ["venture capital", "investment", "vc associate", "analyst"],
}

COMPANY_STAGE_SIGNALS = {
    "seed": ["pre-seed", "seed funded", "angel funded", "bootstrapped", "early stage"],
    "series_a": ["series a", "product-market fit", "post-pmf"],
    "series_b": ["series b", "growth stage", "scaling", "high-growth"],
    "series_c_plus": ["series c", "series d", "series e", "late stage", "well-funded"],
    "pre_ipo": ["pre-ipo", "unicorn", "decacorn", "ipo-bound"],
    "public": ["listed", "nse", "bse", "publicly traded", "fortune 500", "fortune 1000"],
    "mnc": ["mnc", "multinational", "global corporation"],
}

INDUSTRY_SIGNALS = {
    "Enterprise AI": ["agentic ai", "generative ai", "enterprise ai", "llm", "ai assistant"],
    "SaaS": ["saas", "b2b software", "subscription platform"],
    "FinTech": ["fintech", "payments", "lending", "banking", "wallet"],
    "E-commerce": ["e-commerce", "marketplace", "d2c", "consumer internet"],
    "HealthTech": ["healthtech", "health care", "clinical", "patient"],
    "EdTech": ["edtech", "learning platform", "education technology"],
    "Consulting": ["consulting", "advisory", "professional services"],
}

LOCATION_ALIASES = {
    "delhi ncr": "Delhi NCR",
    "gurgaon": "Gurgaon",
    "gurugram": "Gurgaon",
    "delhi": "Delhi",
    "mumbai": "Mumbai",
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "pune": "Pune",
    "remote": "Remote",
    "india": "India",
}


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def build_dedup_key(company: str, title: str, location: str | None) -> str:
    loc = normalize_text((location or "").split(",")[0]).lower()
    return f"{normalize_text(company).lower()}|{normalize_text(title).lower()}|{loc}"


def parse_salary_text(salary_text: str | None) -> Tuple[float | None, float | None]:
    if not salary_text:
        return None, None
    text = salary_text.lower().replace(",", "")
    if "not disclosed" in text:
        return None, None
    matches = re.findall(r"(\d+(?:\.\d+)?)", text)
    if not matches:
        return None, None
    values = [float(m) for m in matches]
    if "crore" in text:
        values = [value * 100 for value in values]
    elif "lac" in text or "lpa" in text or "per annum" in text or "pa" in text:
        values = values
    elif "₹" in salary_text or "rs" in text:
        values = [round(value / 100000, 1) if value > 200 else value for value in values]
    if len(values) == 1:
        return values[0], values[0]
    return min(values), max(values)


def extract_experience_range(text: str) -> Tuple[float | None, float | None]:
    patterns = [
        r"(\d+(?:\.\d+)?)\s*[-to]+\s*(\d+(?:\.\d+)?)\s+years",
        r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s+yrs",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return float(match.group(1)), float(match.group(2))
    plus_match = re.search(r"(\d+(?:\.\d+)?)\+?\s+years", text)
    if plus_match:
        value = float(plus_match.group(1))
        return value, value + 3
    minimum_match = re.search(r"minimum\s+(\d+(?:\.\d+)?)\s+years", text)
    if minimum_match:
        value = float(minimum_match.group(1))
        return value, value + 3
    return None, None


def classify_role(title: str, description: str) -> str:
    haystack = f"{title} {description}".lower()
    for role_type, keywords in ROLE_CLASSIFIERS.items():
        if any(keyword in haystack for keyword in keywords):
            return role_type
    return "other"


def classify_seniority(title: str, description: str) -> str:
    haystack = f"{title} {description}".lower()
    if any(keyword in haystack for keyword in ["director", "vp", "head", "principal", "lead", "senior"]):
        return "senior"
    if any(keyword in haystack for keyword in ["associate", "junior", "intern", "entry"]):
        return "entry"
    return "mid"


def detect_company_stage(description: str) -> str:
    lower = description.lower()
    for stage, keywords in COMPANY_STAGE_SIGNALS.items():
        if any(keyword in lower for keyword in keywords):
            return stage
    return "unknown"


def detect_industry(description: str, title: str) -> str | None:
    haystack = f"{title} {description}".lower()
    for industry, keywords in INDUSTRY_SIGNALS.items():
        if any(keyword in haystack for keyword in keywords):
            return industry
    return None


def extract_location_city(location: str | None, description: str) -> str | None:
    haystack = normalize_text(f"{location or ''} {description}").lower()
    for alias, canonical in LOCATION_ALIASES.items():
        if alias in haystack:
            return canonical
    return normalize_text(location) or None


def location_match_score(city: str | None) -> int:
    if not city:
        return 50
    exact = PROFILE["target_locations"].get(city)
    if exact is not None:
        return exact
    for key, value in PROFILE["target_locations"].items():
        if key.lower() in city.lower() or city.lower() in key.lower():
            return value
    return 50


def split_jd_sections(desc: str) -> Tuple[str, str]:
    preferred_markers = ["nice to have", "preferred", "bonus", "good to have", "plus if you have", "additionally"]
    for marker in preferred_markers:
        if marker in desc:
            index = desc.index(marker)
            return desc[:index], desc[index:]
    return desc, ""


def extract_skills(text: str) -> list[str]:
    skills = []
    lower = text.lower()
    for canonical, variants in SKILL_VARIANTS.items():
        if any(variant in lower for variant in variants):
            skills.append(canonical)
    return sorted(set(skills))


def parse_posting_age(posting_date: str | None) -> int | None:
    if not posting_date:
        return None
    text = posting_date.lower().strip()
    if text in {"today", "just now", "few hours ago"}:
        return 0
    if "yesterday" in text or "1 day" in text:
        return 1
    day_match = re.search(r"(\d+)\s+day", text)
    if day_match:
        return int(day_match.group(1))
    try:
        dt = parsedate_to_datetime(posting_date)
        return max((datetime.now(timezone.utc) - dt).days, 0)
    except Exception:
        pass
    for fmt in ("%Y-%m-%d", "%d %b %Y", "%d %B %Y"):
        try:
            dt = datetime.strptime(posting_date, fmt)
            return max((datetime.now() - dt).days, 0)
        except ValueError:
            continue
    return None


def extract_reports_to(desc: str) -> str | None:
    patterns = [
        r"report(?:ing)?\s+(?:to|directly to)\s+(?:the\s+)?([A-Za-z][A-Za-z\s&]{1,40})",
        r"work(?:ing)?\s+(?:with|closely with|directly with)\s+(?:the\s+)?([A-Za-z][A-Za-z\s&]{1,40})",
    ]
    for pattern in patterns:
        match = re.search(pattern, desc, flags=re.IGNORECASE)
        if match:
            return normalize_text(match.group(1).title())
    return None


def extract_team_size(desc: str) -> str | None:
    match = re.search(r"(?:team of|manage|build a team of)\s+(\d{1,3})", desc)
    if match:
        return match.group(1)
    return None


def parse_job(job: Dict[str, Any]) -> Dict[str, Any]:
    title = normalize_text(job.get("title"))
    description = normalize_text(job.get("description"))
    description_lower = description.lower()
    required_section, preferred_section = split_jd_sections(description_lower)

    skills_required = extract_skills(required_section)
    skills_preferred = [skill for skill in extract_skills(preferred_section) if skill not in skills_required]
    my_skills = {skill.lower() for skill in (PROFILE["hard_skills"] + PROFILE["business_skills"])}
    matched = [skill for skill in skills_required if skill.lower() in my_skills]
    missing = [skill for skill in skills_required if skill.lower() not in my_skills]
    skill_match_pct = round((len(matched) / max(len(skills_required), 1)) * 100, 1)

    role_type = classify_role(title, description)
    seniority = classify_seniority(title, description)
    exp_min, exp_max = extract_experience_range(description_lower)
    my_exp = PROFILE["total_experience_years"]
    if exp_min is None and exp_max is None:
        experience_fit = "unknown"
    elif exp_min <= my_exp <= (exp_max or my_exp):
        experience_fit = "exact_fit"
    elif my_exp < exp_min and (exp_min - my_exp) <= 1:
        experience_fit = "slight_stretch"
    elif my_exp < exp_min:
        experience_fit = "underqualified"
    else:
        experience_fit = "overqualified"

    city = extract_location_city(job.get("location"), description)
    salary_min, salary_max = parse_salary_text(job.get("salary_text"))

    updates = {
        "role_title_clean": title,
        "role_type": role_type,
        "seniority": seniority,
        "reports_to": extract_reports_to(description),
        "team_size": extract_team_size(description_lower),
        "is_first_hire": any(keyword in description_lower for keyword in ["first hire", "founding member", "founding team", "employee #"]),
        "skills_required": skills_required,
        "skills_preferred": skills_preferred,
        "skills_raw": skills_required + skills_preferred,
        "skills_matched": matched,
        "skills_missing": missing,
        "skill_match_pct": skill_match_pct,
        "experience_min": exp_min,
        "experience_max": exp_max,
        "experience_fit": experience_fit,
        "domain_required": [industry for industry in INDUSTRY_SIGNALS if industry.lower() in description_lower],
        "mba_required": any(keyword in description_lower for keyword in ["mba required", "mba mandatory", "must have mba"]),
        "mba_preferred": any(keyword in description_lower for keyword in ["mba preferred", "premier b-school", "top b-school", "iim", "isb", "xlri"]),
        "salary_min_lpa": salary_min or job.get("salary_min_lpa"),
        "salary_max_lpa": salary_max or job.get("salary_max_lpa"),
        "has_esop": any(keyword in description_lower for keyword in ["esop", "equity", "stock option", "ownership stake"]),
        "compensation_notes": normalize_text(job.get("salary_text")),
        "company_stage": job.get("company_stage") or detect_company_stage(description),
        "company_industry": job.get("company_industry") or detect_industry(description, title),
        "company_is_ai": bool(job.get("company_is_ai")) or any(keyword in description_lower for keyword in ["agentic ai", "generative ai", "machine learning", "artificial intelligence"]),
        "location_city": city,
        "location_match_score": location_match_score(city),
        "is_remote": any(keyword in description_lower for keyword in ["remote", "work from home", "wfh", "work from anywhere", "fully remote"]),
        "is_hybrid": any(keyword in description_lower for keyword in ["hybrid", "flexible working", "partial remote"]),
        "days_since_posted": parse_posting_age(job.get("posting_date")),
        "apply_url": job.get("url"),
        "apply_method": (
            "quick_apply" if "naukri.com" in (job.get("url") or "")
            else "company_site"
        ),
        "mentions_consulting_background": any(keyword in description_lower for keyword in ["consulting background", "management consulting", "strategy consulting", "ex-consultant"]),
        "mentions_non_traditional": any(keyword in description_lower for keyword in ["diverse background", "non-traditional", "unconventional", "varied experience"]),
        "mentions_ambiguity": any(keyword in description_lower for keyword in ["ambiguity", "undefined", "unstructured", "no playbook", "figure it out"]),
        "mentions_zero_to_one": any(keyword in description_lower for keyword in ["0 to 1", "zero to one", "build from scratch", "greenfield", "first principles"]),
        "mentions_stakeholder_mgmt": any(keyword in description_lower for keyword in ["stakeholder", "cross-functional", "c-suite", "executive", "leadership alignment"]),
        "mentions_data_driven": any(keyword in description_lower for keyword in ["data-driven", "data driven", "analytics", "metrics", "sql", "dashboard"]),
        "mentions_political_govt": any(keyword in description_lower for keyword in ["government", "public policy", "governance", "policy research", "political"]),
    }
    return updates


def safe_json_loads(value: Any) -> Any:
    if value is None or value == "":
        return []
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return []
