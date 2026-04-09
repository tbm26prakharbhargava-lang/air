from __future__ import annotations

import argparse
import json
import re
import sys
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from policy_mvp.openclaw_adapter import OpenClawAdapter
from policy_mvp.pipeline import (
    generate_policy_brief,
    generate_policy_extraction,
    load_source_packets,
    render_markdown_brief,
    utc_timestamp,
    write_json,
    write_text,
)


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
            unit = "%"
            if "%" not in match:
                unit = "currency_or_count"
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


def build_source_packet_from_capture(args: argparse.Namespace) -> dict:
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
        "title": args.title or title,
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


def command_capture_url(args: argparse.Namespace) -> int:
    packet = build_source_packet_from_capture(args)
    write_json(args.output, packet)
    print(f"Wrote source packet to {args.output}")
    return 0


def command_brief(args: argparse.Namespace) -> int:
    packets = load_source_packets(args.sources_dir)
    brief = generate_policy_brief(args.policy_name, args.policy_question, packets)
    write_json(args.output, {key: value for key, value in brief.items() if not key.startswith("_")})
    if args.markdown_output:
        write_text(args.markdown_output, render_markdown_brief(brief))
    print(f"Wrote brief JSON to {args.output}")
    if args.markdown_output:
        print(f"Wrote brief markdown to {args.markdown_output}")
    return 0


def command_extract(args: argparse.Namespace) -> int:
    packets = load_source_packets(args.sources_dir)
    extraction = generate_policy_extraction(
        args.policy_name,
        packets,
        policy_question=args.policy_question,
    )
    write_json(args.output, extraction)
    print(f"Wrote extraction JSON to {args.output}")
    return 0


def command_demo(args: argparse.Namespace) -> int:
    demo_sources = Path("examples/pmjay-source-packets")
    output_dir = Path(args.output_dir)
    brief_path = output_dir / "pmjay_brief.json"
    markdown_path = output_dir / "pmjay_brief.md"
    extraction_path = output_dir / "pmjay_extraction.json"

    brief_args = argparse.Namespace(
        sources_dir=demo_sources,
        policy_name="Pradhan Mantri Jan Arogya Yojana (PM-JAY) expansion for senior citizens",
        policy_question=(
            "Assess the policy and implementation implications of expanding PM-JAY coverage "
            "to all senior citizens aged 70 and above in India."
        ),
        output=str(brief_path),
        markdown_output=str(markdown_path),
    )
    extract_args = argparse.Namespace(
        sources_dir=demo_sources,
        policy_name="Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        policy_question=brief_args.policy_question,
        output=str(extraction_path),
    )

    command_brief(brief_args)
    command_extract(extract_args)
    print(f"Demo complete. Outputs are in {output_dir}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Runnable MVP for the policy research RAG pipeline.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    capture = subparsers.add_parser("capture-url", help="Capture a live page into a source packet.")
    capture.add_argument("--url", required=True)
    capture.add_argument("--publisher", required=True)
    capture.add_argument("--published-at", default="Unknown")
    capture.add_argument("--source-tier", type=int, required=True)
    capture.add_argument("--document-type", required=True)
    capture.add_argument("--ministry-owner", required=True)
    capture.add_argument("--sector", required=True)
    capture.add_argument("--jurisdiction", default="India")
    capture.add_argument("--title")
    capture.add_argument("--output", required=True)
    capture.add_argument("--use-openclaw", action="store_true")
    capture.add_argument("--browser-profile", default="openclaw")
    capture.set_defaults(func=command_capture_url)

    brief = subparsers.add_parser("brief", help="Generate a structured policy brief from source packets.")
    brief.add_argument("--policy-name", required=True)
    brief.add_argument("--policy-question", required=True)
    brief.add_argument("--sources-dir", required=True)
    brief.add_argument("--output", required=True)
    brief.add_argument("--markdown-output")
    brief.set_defaults(func=command_brief)

    extract = subparsers.add_parser("extract", help="Generate a structured extraction JSON payload.")
    extract.add_argument("--policy-name", required=True)
    extract.add_argument("--policy-question", default="")
    extract.add_argument("--sources-dir", required=True)
    extract.add_argument("--output", required=True)
    extract.set_defaults(func=command_extract)

    demo = subparsers.add_parser("demo", help="Run the bundled PM-JAY MVP demo.")
    demo.add_argument("--output-dir", default="outputs/demo")
    demo.set_defaults(func=command_demo)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except (FileNotFoundError, RuntimeError, HTTPError, URLError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
