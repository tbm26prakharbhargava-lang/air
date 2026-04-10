from __future__ import annotations

from typing import Any, Dict, List
from urllib.parse import quote_plus

from bs4 import BeautifulSoup

from backend.profile import SEARCH_CONFIG
from backend.scrapers.common import (
    build_dedup_key,
    fetch_with_rotating_headers,
    parse_salary_text,
    safe_text,
)


def scrape_linkedin_google(keyword: str, location: str, max_results: int = 10) -> List[Dict[str, Any]]:
    query = quote_plus(f'site:linkedin.com/jobs/view "{keyword}" "{location}"')
    url = f"https://www.google.com/search?q={query}&num={max_results}"
    response = fetch_with_rotating_headers(url)
    soup = BeautifulSoup(response.text, "lxml")
    jobs: List[Dict[str, Any]] = []
    for result in soup.select("div.g"):
        a = result.select_one("a[href]")
        title_el = result.select_one("h3")
        snippet_el = result.select_one(".VwiC3b, .yXK7lf")
        if not a or not title_el:
            continue
        href = a.get("href", "")
        if "linkedin.com/jobs" not in href:
            continue
        title = safe_text(title_el)
        if not title:
            continue
        salary_min, salary_max = parse_salary_text("")
        jobs.append(
            {
                "title": title,
                "company": "LinkedIn Listed Company",
                "location": location,
                "salary_text": None,
                "salary_min_lpa": salary_min,
                "salary_max_lpa": salary_max,
                "source": "linkedin",
                "url": href,
                "description": safe_text(snippet_el),
                "posting_date": "recent",
                "dedup_key": build_dedup_key("LinkedIn Listed Company", title, location),
            }
        )
    return jobs


def scrape_linkedin_public(keyword: str, location: str, max_results: int = 10) -> List[Dict[str, Any]]:
    encoded_keyword = quote_plus(keyword)
    encoded_location = quote_plus(location)
    url = f"https://www.linkedin.com/jobs/search?keywords={encoded_keyword}&location={encoded_location}&f_TPR=r604800"
    response = fetch_with_rotating_headers(url)
    soup = BeautifulSoup(response.text, "lxml")
    jobs: List[Dict[str, Any]] = []
    cards = soup.select("div.base-search-card") or soup.select("li .base-card")
    for card in cards[:max_results]:
        title = safe_text(card.select_one(".base-search-card__title, h3"))
        company = safe_text(card.select_one(".base-search-card__subtitle, h4")) or "LinkedIn Company"
        location_text = safe_text(card.select_one(".job-search-card__location")) or location
        link_el = card.select_one("a.base-card__full-link, a")
        href = link_el.get("href", "") if link_el else ""
        if not title or not href:
            continue
        salary_min, salary_max = parse_salary_text("")
        jobs.append(
            {
                "title": title,
                "company": company,
                "location": location_text,
                "salary_text": None,
                "salary_min_lpa": salary_min,
                "salary_max_lpa": salary_max,
                "source": "linkedin",
                "url": href,
                "description": "",
                "posting_date": safe_text(card.select_one("time")) or "recent",
                "dedup_key": build_dedup_key(company, title, location_text),
            }
        )
    return jobs


def scrape_linkedin_jobs() -> Dict[str, Any]:
    all_jobs: List[Dict[str, Any]] = []
    errors: List[str] = []
    queries = SEARCH_CONFIG["linkedin"]["queries"]
    for query in queries:
        keywords = query["keywords"]
        location = query["location"]
        try:
            jobs = scrape_linkedin_google(keywords, location, max_results=10)
            if not jobs:
                jobs = scrape_linkedin_public(keywords, location, max_results=10)
            all_jobs.extend(jobs)
        except Exception as exc:
            errors.append(f"{keywords}|{location}: {exc}")
    return {"source": "linkedin", "jobs": all_jobs, "queries": queries, "errors": errors}


def fetch_single_job(url: str) -> Dict[str, Any] | None:
    try:
        response = fetch_with_rotating_headers(url)
        soup = BeautifulSoup(response.text, "lxml")
    except Exception:
        return None

    title = ""
    company = ""
    location = "India"
    description = ""
    posting_date = "recent"

    if "linkedin.com" in url:
        title = safe_text(soup.select_one(".top-card-layout__title, h1"))
        company = safe_text(soup.select_one(".topcard__org-name-link, .topcard__flavor"))
        location = safe_text(soup.select_one(".topcard__flavor--bullet")) or location
        description = safe_text(soup.select_one(".show-more-less-html__markup, .description__text"))
        posting_date = safe_text(soup.select_one("time")) or posting_date
        source = "linkedin"
    elif "indeed." in url:
        title = safe_text(soup.select_one("h1, .jobsearch-JobInfoHeader-title"))
        company = safe_text(soup.select_one("[data-testid='inlineHeader-companyName'], .jobsearch-CompanyInfoWithoutHeaderImage"))
        location = safe_text(soup.select_one("[data-testid='job-location'], .jobsearch-JobInfoHeader-subtitle")) or location
        description = safe_text(soup.select_one("#jobDescriptionText"))
        source = "indeed"
    elif "naukri.com" in url:
        title = safe_text(soup.select_one("h1"))
        company = safe_text(soup.select_one("a.comp-name, .jd-header-comp-name"))
        location = safe_text(soup.select_one(".styles_jhc__loc___Du2H, .location")) or location
        description = safe_text(soup.select_one(".styles_JDC__dang-inner-html__h0K4t, .dang-inner-html"))
        source = "naukri"
    else:
        title = safe_text(soup.select_one("h1"))
        company = safe_text(soup.select_one("h2, .company, .employer"))
        description = safe_text(soup.select_one("main, article, .job-description, .description"))
        source = "manual"

    if not title:
        return None

    salary_min, salary_max = parse_salary_text(description)
    company = company or "Unknown"
    return {
        "title": title,
        "company": company,
        "location": location,
        "salary_text": None,
        "salary_min_lpa": salary_min,
        "salary_max_lpa": salary_max,
        "source": source,
        "url": url,
        "description": description,
        "posting_date": posting_date,
        "dedup_key": build_dedup_key(company, title, location),
    }

