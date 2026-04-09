from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError

from app.server import run_server
from policy_mvp.capture import build_source_packet_from_capture
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


def command_serve(args: argparse.Namespace) -> int:
    run_server(host=args.host, port=args.port)
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

    serve = subparsers.add_parser("serve", help="Run the production-style web application.")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8000)
    serve.set_defaults(func=command_serve)
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
