import json
import random
import re
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from backend.parser import build_dedup_key, parse_salary_text


USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
]


def build_headers() -> dict[str, str]:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }


def fetch_with_rotating_headers(
    url: str, params: dict[str, Any] | None = None, timeout: int = 25
) -> requests.Response:
    response = requests.get(url, params=params, headers=build_headers(), timeout=timeout)
    response.raise_for_status()
    return response


def fetch_url(url: str, params: dict[str, Any] | None = None, timeout: int = 25) -> requests.Response:
    return fetch_with_rotating_headers(url, params=params, timeout=timeout)


def fetch_html(
    url: str, params: dict[str, Any] | None = None, timeout: int = 25
) -> tuple[str, int]:
    try:
        response = fetch_with_rotating_headers(url, params=params, timeout=timeout)
        return response.text, response.status_code
    except requests.RequestException as exc:
        status = getattr(exc.response, "status_code", 0) if hasattr(exc, "response") else 0
        return "", status


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def safe_text(node: Any) -> str:
    if node is None:
        return ""
    if hasattr(node, "get_text"):
        return clean_text(node.get_text(" ", strip=True))
    return clean_text(str(node))


def text_or_empty(node: Any) -> str:
    return safe_text(node)


def parse_posting_date_text(value: str | None) -> str:
    if not value:
        return ""
    text = clean_text(value)
    try:
        dt = parsedate_to_datetime(text)
        return dt.date().isoformat()
    except Exception:
        return text


def extract_text_from_json_ld(html: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "lxml")
    result: dict[str, Any] = {}
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(script.get_text(strip=True))
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get("@type") in {"JobPosting", "Posting"}:
                return item
    return result


def insert_jobs(jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return jobs


def detect_source_from_url(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if "naukri" in host:
        return "naukri"
    if "indeed" in host:
        return "indeed"
    if "linkedin" in host:
        return "linkedin"
    return "manual"


def fetch_single_job(url: str) -> dict[str, Any] | None:
    try:
        response = fetch_with_rotating_headers(url, timeout=25)
    except requests.RequestException:
        return None

    soup = BeautifulSoup(response.text, "lxml")
    title = clean_text(soup.title.get_text(" ", strip=True) if soup.title else "")

    json_ld = extract_text_from_json_ld(response.text)
    company = clean_text(json_ld.get("hiringOrganization", {}).get("name")) if isinstance(json_ld.get("hiringOrganization"), dict) else ""
    if not company:
        company = clean_text(
            (
                soup.select_one("[data-testid='company-name']")
                or soup.select_one(".comp-name")
                or soup.select_one(".base-search-card__subtitle")
            ).get_text(" ", strip=True)
            if (
                soup.select_one("[data-testid='company-name']")
                or soup.select_one(".comp-name")
                or soup.select_one(".base-search-card__subtitle")
            )
            else ""
        ) or "Unknown"

    description = clean_text(
        json_ld.get("description")
        or (
            soup.select_one(".styles_JDC__dang-inner-html")
            or soup.select_one("#jobDescriptionText")
            or soup.select_one(".show-more-less-html__markup")
            or soup.select_one("main")
        ).get_text(" ", strip=True)
        if (
            soup.select_one(".styles_JDC__dang-inner-html")
            or soup.select_one("#jobDescriptionText")
            or soup.select_one(".show-more-less-html__markup")
            or soup.select_one("main")
        )
        else ""
    )

    location = clean_text(json_ld.get("jobLocation", {}).get("address", {}).get("addressLocality")) if isinstance(json_ld.get("jobLocation"), dict) else ""
    if not location:
        loc_node = (
            soup.select_one("[data-testid='text-location']")
            or soup.select_one(".locWdth")
            or soup.select_one(".job-search-card__location")
        )
        location = safe_text(loc_node)

    salary_text = ""
    if isinstance(json_ld.get("baseSalary"), dict):
        value = json_ld["baseSalary"].get("value", {})
        min_value = value.get("minValue")
        max_value = value.get("maxValue")
        if min_value or max_value:
            if min_value and max_value:
                salary_text = f"{min_value}-{max_value}"
            else:
                salary_text = str(min_value or max_value)
    salary_min, salary_max = parse_salary_text(salary_text)
    source = detect_source_from_url(url)

    if not title and not description:
        return None

    return {
        "title": title or "Untitled role",
        "company": company or "Unknown",
        "location": location,
        "salary_text": salary_text or None,
        "salary_min_lpa": salary_min,
        "salary_max_lpa": salary_max,
        "source": source,
        "url": url,
        "description": description,
        "posting_date": parse_posting_date_text(clean_text(json_ld.get("datePosted"))),
        "dedup_key": build_dedup_key(company or "Unknown", title or "Untitled role", location),
    }


def now_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds")
