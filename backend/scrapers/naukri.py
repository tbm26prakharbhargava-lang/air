from __future__ import annotations

from typing import Dict, List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from backend.profile import SEARCH_CONFIG
from backend.scrapers.common import (
    build_dedup_key,
    fetch_with_rotating_headers,
    parse_salary_text,
    safe_text,
)


def scrape_naukri_query(keywords: str, location: str, experience: str = "0-4", limit: int = 10) -> Dict:
    url = (
        f"https://www.naukri.com/{quote_plus(keywords).replace('+', '-')}-jobs-in-{quote_plus(location).replace('+', '-')}"
        f"?experience={quote_plus(experience)}"
    )
    jobs: List[Dict] = []
    errors: List[str] = []

    try:
        response = fetch_with_rotating_headers(url)
        soup = BeautifulSoup(response.text, "lxml")
        cards = soup.select("article.jobTuple, div.srp-jobtuple-wrapper")[:limit]
        for card in cards:
            title_el = card.select_one("a.title")
            company_el = card.select_one("a.comp-name, span.comp-name")
            location_el = card.select_one("span.locWdth, span.loc-wrap, div.row-2 span")
            salary_el = card.select_one("span.sal, span.salary, span.sal-wrap")
            desc_el = card.select_one("span.job-desc, div.job-desc")
            link = title_el.get("href") if title_el else ""
            salary_text = safe_text(salary_el)
            salary_min, salary_max = parse_salary_text(salary_text)
            title = safe_text(title_el)
            company = safe_text(company_el) or "Unknown"
            location_text = safe_text(location_el) or location
            if not title:
                continue
            jobs.append(
                {
                    "title": title,
                    "company": company,
                    "location": location_text,
                    "salary_text": salary_text or None,
                    "salary_min_lpa": salary_min,
                    "salary_max_lpa": salary_max,
                    "source": "naukri",
                    "url": link,
                    "description": safe_text(desc_el),
                    "posting_date": "today",
                    "dedup_key": build_dedup_key(company, title, location_text),
                }
            )
    except Exception as exc:
        errors.append(str(exc))

    return {"source": "naukri", "jobs": jobs, "queries": [{"keywords": keywords, "location": location, "experience": experience}], "errors": errors}


def scrape_naukri() -> Dict:
    all_jobs: List[Dict] = []
    errors: List[str] = []
    queries = SEARCH_CONFIG["naukri"]["queries"]
    for query in queries:
        result = scrape_naukri_query(
            query["keywords"],
            query["location"],
            query.get("experience", "0-4"),
            limit=SEARCH_CONFIG["naukri"].get("max_per_query", 10),
        )
        all_jobs.extend(result["jobs"])
        errors.extend(result.get("errors", []))
    return {"source": "naukri", "jobs": all_jobs, "queries": queries, "errors": errors}
