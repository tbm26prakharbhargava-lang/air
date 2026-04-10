from backend.database import get_job_by_id, get_job_rank_for_company_title, insert_job, update_job_scores
from backend.parser import build_dedup_key, parse_job
from backend.scoring import score_job


LEENA_AI_EIR = {
    "title": "Entrepreneur in Residence (EIR)",
    "company": "Leena AI",
    "location": "Gurgaon",
    "salary_text": "25-30 LPA (estimated)",
    "salary_min_lpa": 25,
    "salary_max_lpa": 30,
    "source": "manual",
    "url": "https://leena.ai/careers",
    "description": """Leena AI — Entrepreneur in Residence (EIR)
Enterprise agentic AI company automating HR, IT, Finance, and Procurement. Series B ($40.1M total funding led by Bessemer). Roughly $15.8M ARR and 100+ enterprise customers.
The role sits inside the GTM engine and focuses on building systems, hiring teams, and executing playbooks. This is not a pure strategy role. It includes automating market research using AI tools, improving CRM quality, compressing lead response times, building outbound SDR systems, and scaling executive events.
Key signals: structured problem decomposition, data fluency, AI tool literacy, hiring, executive stakeholder management, cross-functional execution, bias for action, no ego, comfort with ambiguity, willingness to get hands dirty.
Why now: the Moveworks acquisition by ServiceNow opened a displacement window that Leena AI wants to capture quickly.""",
    "posting_date": "2026-03-25",
    "company_stage": "series_b",
    "company_is_ai": 1,
    "company_glassdoor_rating": 3.8,
    "company_employee_count": "200-300",
}


def insert_leena_ai_role() -> dict:
    payload = dict(LEENA_AI_EIR)
    payload["dedup_key"] = build_dedup_key(payload["company"], payload["title"], payload["location"])
    parsed_updates = parse_job(payload)
    payload.update(parsed_updates)
    job_id = insert_job(payload)
    if job_id is None:
        ranking = get_job_rank_for_company_title("Leena AI", "Entrepreneur in Residence (EIR)")
        if ranking:
            existing = get_job_by_id(ranking["id"])
            return {"inserted": False, "job": existing, "ranking": ranking}
        raise RuntimeError("Leena AI role already exists but could not be located.")
    breakdown = score_job(get_job_by_id(job_id))
    update_job_scores(job_id, breakdown)
    job = get_job_by_id(job_id)
    ranking = get_job_rank_for_company_title("Leena AI", "Entrepreneur in Residence (EIR)")
    return {"inserted": True, "job": job, "ranking": ranking, "breakdown": breakdown}


def get_leena_job() -> dict | None:
    ranking = get_job_rank_for_company_title("Leena AI", "Entrepreneur in Residence (EIR)")
    if not ranking:
        return None
    return get_job_by_id(ranking["id"])
