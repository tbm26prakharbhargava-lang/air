import json
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Any, Dict, Iterable, Optional


ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "job_search_assistant.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _to_dict(row: Optional[sqlite3.Row]) -> Optional[Dict[str, Any]]:
    if row is None:
        return None
    return dict(row)


def init_db() -> None:
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT,
                location_city TEXT,
                location_match_score INTEGER,
                salary_text TEXT,
                salary_min_lpa REAL,
                salary_max_lpa REAL,
                salary_estimated_lpa REAL,
                source TEXT NOT NULL,
                url TEXT,
                description TEXT,
                posting_date TEXT,
                days_since_posted INTEGER,
                applicant_count INTEGER,
                scraped_at TEXT DEFAULT (datetime('now')),
                role_title_clean TEXT,
                role_type TEXT,
                seniority TEXT,
                reports_to TEXT,
                team_size TEXT,
                is_first_hire INTEGER DEFAULT 0,
                experience_min REAL,
                experience_max REAL,
                experience_fit TEXT,
                domain_required TEXT,
                mba_required INTEGER DEFAULT 0,
                mba_preferred INTEGER DEFAULT 0,
                skills_required TEXT,
                skills_preferred TEXT,
                skills_raw TEXT,
                skills_matched TEXT,
                skills_missing TEXT,
                skill_match_pct REAL,
                is_remote INTEGER DEFAULT 0,
                is_hybrid INTEGER DEFAULT 0,
                apply_url TEXT,
                apply_method TEXT,
                hr_email TEXT,
                recruiter_linkedin TEXT,
                has_esop INTEGER DEFAULT 0,
                compensation_notes TEXT,
                company_stage TEXT,
                company_industry TEXT,
                company_employee_count TEXT,
                company_funding_total TEXT,
                company_investors TEXT,
                company_glassdoor_rating REAL,
                company_glassdoor_wlb REAL,
                company_is_ai INTEGER DEFAULT 0,
                company_yc_backed INTEGER DEFAULT 0,
                mentions_consulting_background INTEGER DEFAULT 0,
                mentions_non_traditional INTEGER DEFAULT 0,
                mentions_ambiguity INTEGER DEFAULT 0,
                mentions_zero_to_one INTEGER DEFAULT 0,
                mentions_stakeholder_mgmt INTEGER DEFAULT 0,
                mentions_data_driven INTEGER DEFAULT 0,
                mentions_political_govt INTEGER DEFAULT 0,
                score_zero_to_one REAL,
                score_impact_learning REAL,
                score_company_stage REAL,
                score_compensation REAL,
                score_profile_fit REAL,
                score_ai_bonus REAL,
                score_freshness_bonus REAL,
                score_total REAL,
                score_weights_used TEXT,
                score_breakdown TEXT,
                status TEXT DEFAULT 'new',
                resume_template TEXT,
                dedup_key TEXT UNIQUE,
                created_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS actions_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                details TEXT,
                status TEXT DEFAULT 'completed',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS scrape_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                query TEXT NOT NULL,
                jobs_found INTEGER DEFAULT 0,
                new_jobs INTEGER DEFAULT 0,
                errors TEXT,
                started_at TEXT DEFAULT (datetime('now')),
                completed_at TEXT
            )
            """
        )
        conn.commit()


def _normalize_value(value: Any) -> Any:
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    if isinstance(value, bool):
        return int(value)
    return value


def _filter_columns(payload: Dict[str, Any]) -> Dict[str, Any]:
    with closing(get_connection()) as conn:
        cur = conn.execute("PRAGMA table_info(jobs)")
        columns = {row["name"] for row in cur.fetchall()}
    return {k: _normalize_value(v) for k, v in payload.items() if k in columns}


def check_duplicate(dedup_key: str) -> bool:
    if not dedup_key:
        return False
    with closing(get_connection()) as conn:
        row = conn.execute(
            "SELECT id FROM jobs WHERE dedup_key = ?",
            (dedup_key,),
        ).fetchone()
        return row is not None


def insert_job(job_dict: Dict[str, Any]) -> Optional[int]:
    payload = _filter_columns(job_dict)
    if not payload:
        return None
    columns = ", ".join(payload.keys())
    placeholders = ", ".join(["?"] * len(payload))
    values = list(payload.values())
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        try:
            cur.execute(
                f"INSERT INTO jobs ({columns}) VALUES ({placeholders})",
                values,
            )
        except sqlite3.IntegrityError:
            return None
        conn.commit()
        return int(cur.lastrowid)


def bulk_insert_jobs(jobs: Iterable[Dict[str, Any]]) -> int:
    inserted = 0
    for job in jobs:
        job_id = insert_job(job)
        if job_id:
            inserted += 1
    return inserted


def get_all_jobs(filters: Optional[Dict[str, Any]] = None) -> list[Dict[str, Any]]:
    query = "SELECT * FROM jobs"
    clauses = []
    params: list[Any] = []
    if filters:
        if filters.get("min_score") is not None:
            clauses.append("COALESCE(score_total, 0) >= ?")
            params.append(filters["min_score"])
        for key in ("role_type", "location", "source", "status"):
            value = filters.get(key)
            if value:
                if key == "location":
                    clauses.append("location LIKE ?")
                    params.append(f"%{value}%")
                else:
                    clauses.append(f"{key} = ?")
                    params.append(value)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY COALESCE(score_total, 0) DESC, scraped_at DESC"
    with closing(get_connection()) as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def get_all_jobs_filtered(**filters: Any) -> list[Dict[str, Any]]:
    return get_all_jobs(filters)


def get_job_by_id(job_id: int) -> Optional[Dict[str, Any]]:
    with closing(get_connection()) as conn:
        row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        return _to_dict(row)


def update_job(job_id: int, updates: Dict[str, Any]) -> None:
    payload = _filter_columns(updates)
    if not payload:
        return
    assignments = ", ".join([f"{key} = ?" for key in payload])
    values = list(payload.values()) + [job_id]
    with closing(get_connection()) as conn:
        conn.execute(f"UPDATE jobs SET {assignments} WHERE id = ?", values)
        conn.commit()


def update_job_scores(job_id: int, scores_dict: Dict[str, Any]) -> None:
    update_job(
        job_id,
        {
            "score_zero_to_one": scores_dict["dimensions"]["zero_to_one"]["score"],
            "score_impact_learning": scores_dict["dimensions"]["impact_learning"]["score"],
            "score_company_stage": scores_dict["dimensions"]["company_stage"]["score"],
            "score_compensation": scores_dict["dimensions"]["compensation"]["score"],
            "score_profile_fit": scores_dict["dimensions"]["profile_fit"]["score"],
            "score_ai_bonus": scores_dict["bonuses"]["ai_bonus"],
            "score_freshness_bonus": scores_dict["bonuses"]["freshness_bonus"],
            "score_total": scores_dict["total"],
            "score_weights_used": scores_dict.get("weights_used", {}),
            "score_breakdown": scores_dict,
        },
    )


def update_job_status(job_id: int, status: str) -> None:
    update_job(job_id, {"status": status})


def log_action(job_id: int, action_type: str, details: Dict[str, Any], status: str = "completed") -> int:
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO actions_log (job_id, action_type, details, status)
            VALUES (?, ?, ?, ?)
            """,
            (job_id, action_type, json.dumps(details), status),
        )
        conn.commit()
        return int(cur.lastrowid)


def get_actions_log() -> list[Dict[str, Any]]:
    with closing(get_connection()) as conn:
        rows = conn.execute(
            "SELECT * FROM actions_log ORDER BY created_at DESC, id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def get_action_log() -> list[Dict[str, Any]]:
    return get_actions_log()


def log_scrape(source: str, query: str, jobs_found: int, new_jobs: int, errors: Optional[str] = None) -> int:
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO scrape_log (source, query, jobs_found, new_jobs, errors, completed_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            """,
            (source, query, jobs_found, new_jobs, errors),
        )
        conn.commit()
        return int(cur.lastrowid)


def get_job_rank_for_company_title(company: str, title: str) -> Optional[Dict[str, Any]]:
    with closing(get_connection()) as conn:
        row = conn.execute(
            """
            SELECT id, title, company, score_total
            FROM jobs
            WHERE lower(company) = lower(?) AND lower(title) = lower(?)
            ORDER BY COALESCE(score_total, 0) DESC
            LIMIT 1
            """,
            (company, title),
        ).fetchone()
        if row is None:
            return None
        rank_row = conn.execute(
            """
            SELECT COUNT(*) + 1 AS ranking
            FROM jobs
            WHERE COALESCE(score_total, 0) > COALESCE(?, 0)
            """,
            (row["score_total"],),
        ).fetchone()
        result = dict(row)
        result["ranking"] = rank_row["ranking"]
        return result


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
