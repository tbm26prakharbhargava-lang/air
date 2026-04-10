from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.actions.gmail_sender import generate_email, send_email
from backend.actions.resume_tailor import select_resume_template
from backend.database import (
    get_actions_log,
    get_all_jobs,
    get_job_by_id,
    init_db,
    insert_job,
    log_action,
    log_scrape,
    update_job,
    update_job_status,
)
from backend.leena_ai import insert_leena_ai_role
from backend.parser import parse_job
from backend.profile import PROFILE, SCORING_PRESETS
from backend.scoring import SCORING_NOTE, score_all_jobs
from backend.scrapers import (
    fetch_single_job,
    scrape_indeed,
    scrape_linkedin_jobs,
    scrape_naukri,
)


class SingleUrlRequest(BaseModel):
    url: str


class StatusRequest(BaseModel):
    status: str


class EmailRequest(BaseModel):
    job_id: int
    recipient_email: Optional[str] = None


class ResumeRequest(BaseModel):
    job_id: int


app = FastAPI(title="Prakhar Job Search Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/profile")
def profile() -> Dict[str, Any]:
    return PROFILE


def _persist_scrape_result(source: str, result: Dict[str, Any]) -> Dict[str, Any]:
    inserted = 0
    jobs = result.get("jobs", [])
    errors = result.get("errors", [])
    for job in jobs:
        row_id = insert_job(job)
        if row_id:
            inserted += 1
    log_scrape(
        source=source,
        query=str(result.get("queries", [])),
        jobs_found=len(jobs),
        new_jobs=inserted,
        errors="\n".join(errors) if errors else None,
    )
    return {
        "source": source,
        "jobs_found": len(jobs),
        "new_jobs": inserted,
        "errors": errors,
    }


@app.post("/api/scrape/naukri")
def api_scrape_naukri() -> Dict[str, Any]:
    return _persist_scrape_result("naukri", scrape_naukri())


@app.post("/api/scrape/indeed")
def api_scrape_indeed() -> Dict[str, Any]:
    return _persist_scrape_result("indeed", scrape_indeed())


@app.post("/api/scrape/linkedin")
def api_scrape_linkedin() -> Dict[str, Any]:
    return _persist_scrape_result("linkedin", scrape_linkedin_jobs())


@app.post("/api/scrape/all")
def api_scrape_all() -> Dict[str, Any]:
    return {
        "naukri": _persist_scrape_result("naukri", scrape_naukri()),
        "indeed": _persist_scrape_result("indeed", scrape_indeed()),
        "linkedin": _persist_scrape_result("linkedin", scrape_linkedin_jobs()),
    }


@app.post("/api/scrape/single")
def api_scrape_single(req: SingleUrlRequest) -> Dict[str, Any]:
    job = fetch_single_job(req.url)
    if not job:
        raise HTTPException(status_code=400, detail="Could not parse job from URL")
    row_id = insert_job(job)
    return {"inserted": bool(row_id), "job_id": row_id, "job": job}


@app.post("/api/parse")
def api_parse() -> Dict[str, Any]:
    jobs = get_all_jobs()
    parsed_count = 0
    for job in jobs:
        parsed = parse_job(job)
        update_job(job["id"], parsed)
        parsed_count += 1
    return {"parsed_jobs": parsed_count}


@app.post("/api/score")
def api_score() -> Dict[str, Any]:
    results = score_all_jobs()
    return {"scored_jobs": len(results)}


@app.post("/api/score/custom")
def api_score_custom(weights: Dict[str, float]) -> Dict[str, Any]:
    results = score_all_jobs(weights)
    return {"jobs": results, "weights_applied": weights, "total_scored": len(results)}


@app.get("/api/score/presets")
def api_score_presets() -> Dict[str, Any]:
    return SCORING_PRESETS


@app.post("/api/pipeline")
def api_pipeline() -> Dict[str, Any]:
    scrape_summary = api_scrape_all()
    parse_summary = api_parse()
    score_summary = api_score()
    jobs = get_all_jobs()
    return {
        "scrape": scrape_summary,
        "parse": parse_summary,
        "score": score_summary,
        "jobs_count": len(jobs),
    }


@app.get("/api/jobs")
def api_jobs(
    min_score: Optional[float] = Query(None),
    role_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
) -> Dict[str, Any]:
    filters = {
        "min_score": min_score,
        "role_type": role_type,
        "location": location,
        "source": source,
        "status": status,
    }
    jobs = get_all_jobs(filters=filters)
    return {"jobs": jobs}


@app.get("/api/jobs/{job_id}")
def api_job(job_id: int) -> Dict[str, Any]:
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.patch("/api/jobs/{job_id}/status")
def api_job_status(job_id: int, req: StatusRequest) -> Dict[str, Any]:
    update_job_status(job_id, req.status)
    return {"updated": True, "job_id": job_id, "status": req.status}


@app.post("/api/actions/email")
def api_action_email(req: EmailRequest) -> Dict[str, Any]:
    job = get_job_by_id(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    message = generate_email(job, PROFILE)
    recipient = req.recipient_email or PROFILE["email"]
    result = send_email(job["id"], recipient, message["subject"], message["body"])
    if result.get("sent"):
        update_job_status(job["id"], "emailed")
    return {"message": message, "delivery": result}


@app.post("/api/actions/resume")
def api_action_resume(req: ResumeRequest) -> Dict[str, Any]:
    job = get_job_by_id(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    recommendation = select_resume_template(job)
    update_job(job["id"], {"resume_template": recommendation["template_name"]})
    log_action(job["id"], "resume_generated", recommendation)
    return recommendation


@app.get("/api/actions/log")
def api_actions_log() -> Dict[str, Any]:
    return {"actions": get_actions_log()}


@app.post("/api/leena-ai/insert")
def api_leena_insert() -> Dict[str, Any]:
    result = insert_leena_ai_role()
    score_all_jobs()
    return result


@app.get("/api/leena-ai/ranking")
def api_leena_ranking() -> Dict[str, Any]:
    jobs = get_all_jobs()
    leena = [job for job in jobs if job["company"].lower() == "leena ai"]
    if not leena:
        return {"found": False, "rank": None, "total_jobs": len(jobs), "job": None}
    ordered = sorted(jobs, key=lambda j: j.get("score_total") or 0, reverse=True)
    job = leena[0]
    rank = next((idx + 1 for idx, item in enumerate(ordered) if item["id"] == job["id"]), None)
    return {"found": True, "rank": rank, "total_jobs": len(ordered), "job": job}


@app.get("/api/scoring-note")
def api_scoring_note() -> Dict[str, str]:
    return {"text": SCORING_NOTE}
