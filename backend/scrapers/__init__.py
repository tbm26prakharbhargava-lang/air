from backend.scrapers.indeed import scrape_indeed
from backend.scrapers.linkedin_jobs import fetch_single_job, scrape_linkedin_jobs
from backend.scrapers.naukri import scrape_naukri


def scrape_all_sources():
    naukri = scrape_naukri()
    indeed = scrape_indeed()
    linkedin = scrape_linkedin_jobs()
    return {"results": [naukri, indeed, linkedin]}

__all__ = [
    "scrape_naukri",
    "scrape_indeed",
    "scrape_linkedin_jobs",
    "scrape_all_sources",
    "fetch_single_job",
]

