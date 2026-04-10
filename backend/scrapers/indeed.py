from __future__ import annotations

from urllib.parse import quote_plus

import feedparser
from bs4 import BeautifulSoup

from backend.profile import SEARCH_CONFIG
from backend.scrapers.common import (
    build_dedup_key,
    fetch_url,
    parse_salary_text,
    safe_text,
)


def _rss_url(keywords: str, location: str) -> str:
    return f"https://in.indeed.com/rss?q={quote_plus(keywords)}&l={quote_plus(location)}&fromage=7"


def _html_url(keywords: str, location: str) -> str:
    return f"https://in.indeed.com/jobs?q={quote_plus(keywords)}&l={quote_plus(location)}&fromage=7"


def scrape_indeed_query(keywords: str, location: str, limit: int = 15) -> dict:
    jobs = []
    errors: list[str] = []
    try:
        feed = feedparser.parse(_rss_url(keywords, location))
        entries = feed.entries or []
        for entry in entries[:limit]:
            title = safe_text(getattr(entry, "title", ""))
            company = safe_text(getattr(entry, "author", "")) or "Unknown"
            description = safe_text(getattr(entry, "summary", ""))
            url = getattr(entry, "link", "")
            posting_date = safe_text(getattr(entry, "published", ""))
            salary_min, salary_max = parse_salary_text(description)
            jobs.append(
                {
                    "title": title,
                    "company": company,
                    "location": location,
                    "salary_text": None,
                    "salary_min_lpa": salary_min,
                    "salary_max_lpa": salary_max,
                    "source": "indeed",
                    "url": url,
                    "description": description,
                    "posting_date": posting_date,
                    "dedup_key": build_dedup_key(company, title, location),
                }
            )
        if jobs:
            return {"source": "indeed", "jobs": jobs, "queries": [{"keywords": keywords, "location": location}], "errors": []}
    except Exception as exc:
        errors.append(f"rss_error: {exc}")

    try:
        response = fetch_url(_html_url(keywords, location))
        soup = BeautifulSoup(response.text, "lxml")
        cards = soup.select("[data-jk], .job_seen_beacon")
        for card in cards[:limit]:
            title_el = card.select_one("h2 a span") or card.select_one("h2 span") or card.select_one("a span")
            company_el = card.select_one("[data-testid='company-name']") or card.select_one(".companyName")
            location_el = card.select_one("[data-testid='text-location']") or card.select_one(".companyLocation")
            salary_el = card.select_one(".salary-snippet, .estimated-salary")
            snippet_el = card.select_one(".job-snippet")
            title = safe_text(title_el.get_text(" ", strip=True) if title_el else "")
            company = safe_text(company_el.get_text(" ", strip=True) if company_el else "Unknown")
            location_text = safe_text(location_el.get_text(" ", strip=True) if location_el else location)
            salary_text = safe_text(salary_el.get_text(" ", strip=True) if salary_el else "")
            snippet = safe_text(snippet_el.get_text(" ", strip=True) if snippet_el else "")
            link_el = card.select_one("h2 a")
            href = link_el.get("href", "") if link_el else ""
            url = href if href.startswith("http") else f"https://in.indeed.com{href}" if href else ""
            salary_min, salary_max = parse_salary_text(salary_text)
            jobs.append(
                {
                    "title": title,
                    "company": company,
                    "location": location_text,
                    "salary_text": salary_text or None,
                    "salary_min_lpa": salary_min,
                    "salary_max_lpa": salary_max,
                    "source": "indeed",
                    "url": url,
                    "description": snippet,
                    "posting_date": "recent",
                    "dedup_key": build_dedup_key(company, title, location_text),
                }
            )
    except Exception as exc:
        errors.append(f"html_error: {exc}")

    return {"source": "indeed", "jobs": jobs, "queries": [{"keywords": keywords, "location": location}], "errors": errors}


def scrape_indeed() -> dict:
    all_jobs = []
    all_errors: list[str] = []
    queries = SEARCH_CONFIG["indeed"]["queries"]
    for query in queries:
        result = scrape_indeed_query(query["keywords"], query["location"], SEARCH_CONFIG["indeed"]["max_per_query"])
        all_jobs.extend(result["jobs"])
        all_errors.extend(result.get("errors", []))
    return {"source": "indeed", "jobs": all_jobs, "queries": queries, "errors": all_errors}
