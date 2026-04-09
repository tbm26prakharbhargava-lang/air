from __future__ import annotations

import re
from html import unescape
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from policy_mvp.openclaw_adapter import OpenClawAdapter
from policy_mvp.pipeline import utc_timestamp


def clean_html_to_text(html: str) -> str:
    no_scripts = re.sub(r"<script.*?</script>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    no_styles = re.sub(r"<style.*?</style>", " ", no_scripts, flags=re.IGNORECASE | re.DOTALL)
    stripped = re.sub(r"<[^>]+>", " ", no_styles)
    normalized = re.sub(r"\s+", " ", unescape(stripped))
    return normalized.strip()


def extract_title(html: str, fallback: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return fallback
    return re.sub(r"\s+", " ", unescape(match.group(1))).strip() or fallback


def split_sentences(text: str) -> list[str]:
    return [chunk.strip() for chunk in re.split(r"(?<=[.!?])\s+", text) if chunk.strip()]


def summarize_text(text: str, max_sentences: int = 3) -> str:
    sentences = split_sentences(text)
    return " ".join(sentences[:max_sentences]) if sentences else text[:400]


def extract_numeric_facts(text: str, limit: int = 5) -> list[dict[str, str]]:
    facts = []
    sentences = split_sentences(text)
    pattern = re.compile(
        r"(₹\s?[\d,.]+(?:\s?(?:crore|lakh|cr|mn|bn))?|Rs\.?\s?[\d,.]+(?:\s?(?:crore|lakh|cr))?|[\d,.]+%)",
        flags=re.IGNORECASE,
    )
    for sentence in sentences:
        matches = pattern.findall(sentence)
        if not matches:
            continue
        label = " ".join(sentence.split()[:6]).rstrip(":,.;")
        for match in matches:
            unit = "%" if "%" in match else "currency_or_count"
            facts.append(
                {
                    "label": label or "Detected numeric fact",
                    "value": match.strip(),
                    "unit": unit,
                    "context": sentence[:240],
                }
            )
            if len(facts) >= limit:
                return facts
    return facts


def fetch_url_content(url: str, use_openclaw: bool = False, profile: str = "openclaw") -> tuple[str, str]:
    if use_openclaw:
        adapter = OpenClawAdapter(profile=profile)
        snapshot = adapter.capture_snapshot(url)
        return f"OpenClaw snapshot for {url}", snapshot

    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
        },
    )
    try:
        with urlopen(request, timeout=30) as response:
            html = response.read().decode("utf-8", errors="ignore")
    except HTTPError as exc:
        if exc.code == 403:
            raise RuntimeError(
                f"Direct HTTP fetch was blocked for {url}. Retry with --use-openclaw "
                "for browser-based capture or choose a less restrictive source."
            ) from exc
        raise
    return extract_title(html, url), clean_html_to_text(html)


def build_source_packet_from_capture(args) -> dict:
    title, text = fetch_url_content(
        args.url,
        use_openclaw=args.use_openclaw,
        profile=args.browser_profile,
    )
    sentences = split_sentences(text)
    summary = summarize_text(text)
    key_claims = sentences[:5]
    quote_snippets = sentences[:3]
    return {
        "title": getattr(args, "title", None) or title,
        "url": args.url,
        "publisher": args.publisher,
        "published_at": args.published_at,
        "captured_at": utc_timestamp(),
        "source_tier": args.source_tier,
        "document_type": args.document_type,
        "ministry_owner": args.ministry_owner,
        "sector": args.sector,
        "jurisdiction": args.jurisdiction,
        "summary": summary,
        "key_claims": key_claims,
        "numeric_facts": extract_numeric_facts(text),
        "quote_snippets": quote_snippets,
        "extraction_notes": (
            "Captured with OpenClaw browser snapshot."
            if args.use_openclaw
            else "Captured with HTTP fetch fallback because OpenClaw is unavailable or not requested."
        ),
    }
