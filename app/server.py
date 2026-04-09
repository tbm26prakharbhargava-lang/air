from __future__ import annotations

import json
import traceback
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from string import Template
from typing import Any
from urllib.parse import urlparse

from policy_mvp.capture import build_source_packet_from_capture
from policy_mvp.pipeline import (
    generate_policy_brief,
    generate_policy_extraction,
    load_source_packets,
    render_markdown_brief,
)
from policy_mvp.storage import RunStore


APP_ROOT = Path(__file__).resolve().parent
WORKSPACE_ROOT = APP_ROOT.parent
STATIC_DIR = APP_ROOT / "static"
TEMPLATE_DIR = APP_ROOT / "templates"
DEFAULT_SAMPLE_DIR = WORKSPACE_ROOT / "examples" / "pmjay-source-packets"


def read_template(name: str) -> Template:
    return Template((TEMPLATE_DIR / name).read_text(encoding="utf-8"))


def read_static_text(path: str) -> str:
    return (STATIC_DIR / path).read_text(encoding="utf-8")


def sample_packets() -> list[dict[str, Any]]:
    return load_source_packets(DEFAULT_SAMPLE_DIR)


def sample_definitions() -> list[dict[str, Any]]:
    return [
        {
            "id": "pmjay-demo",
            "name": "PM-JAY senior citizen expansion",
            "policy_name": "Pradhan Mantri Jan Arogya Yojana (PM-JAY) expansion for senior citizens",
            "policy_question": (
                "Assess the policy and implementation implications of expanding PM-JAY coverage "
                "to all senior citizens aged 70 and above in India."
            ),
            "sources_dir": "examples/pmjay-source-packets",
        }
    ]


class PolicyWorkbench:
    def __init__(self) -> None:
        self.store = RunStore()

    def run_analysis(
        self,
        *,
        policy_name: str,
        policy_question: str,
        packets: list[dict[str, Any]],
        mode: str,
    ) -> dict[str, Any]:
        brief = generate_policy_brief(policy_name, policy_question, packets)
        extraction = generate_policy_extraction(policy_name, packets, policy_question=policy_question)
        run_id = self.store.save_run(
            policy_name=policy_name,
            policy_question=policy_question,
            mode=mode,
            packets=packets,
            selected_packets=packets,
            brief=brief,
            extraction=extraction,
        )
        return {
            "run_id": run_id,
            "policy_name": policy_name,
            "policy_question": policy_question,
            "brief": brief,
            "brief_markdown": render_markdown_brief(brief),
            "extraction": extraction,
            "packets": packets,
            "selected_packets": packets,
        }

    def run_demo(self) -> dict[str, Any]:
        return self.run_analysis(
            policy_name="Pradhan Mantri Jan Arogya Yojana (PM-JAY) expansion for senior citizens",
            policy_question=(
                "Assess the policy and implementation implications of expanding PM-JAY coverage "
                "to all senior citizens aged 70 and above in India."
            ),
            packets=sample_packets(),
            mode="demo",
        )

    def run_from_directory(self, *, policy_name: str, policy_question: str, sources_dir: str) -> dict[str, Any]:
        packets = load_source_packets(sources_dir)
        return self.run_analysis(
            policy_name=policy_name,
            policy_question=policy_question,
            packets=packets,
            mode="directory",
        )

    def run_from_packets(
        self,
        *,
        policy_name: str,
        policy_question: str,
        packets: list[dict[str, Any]],
    ) -> dict[str, Any]:
        return self.run_analysis(
            policy_name=policy_name,
            policy_question=policy_question,
            packets=packets,
            mode="manual-packets",
        )

    def run_from_urls(
        self,
        *,
        policy_name: str,
        policy_question: str,
        urls: list[dict[str, Any]],
        use_openclaw: bool,
        browser_profile: str,
    ) -> dict[str, Any]:
        packets = []
        for item in urls:
            args = type(
                "CaptureArgs",
                (),
                {
                    "url": item["url"],
                    "publisher": item.get("publisher", "Unknown"),
                    "published_at": item.get("published_at", "Unknown"),
                    "source_tier": int(item.get("source_tier", 3)),
                    "document_type": item.get("document_type", "web_page"),
                    "ministry_owner": item.get("ministry_owner", "Unknown"),
                    "sector": item.get("sector", "Governance"),
                    "jurisdiction": item.get("jurisdiction", "India"),
                    "title": item.get("title"),
                    "use_openclaw": use_openclaw,
                    "browser_profile": browser_profile,
                },
            )()
            packets.append(build_source_packet_from_capture(args))

        return self.run_analysis(
            policy_name=policy_name,
            policy_question=policy_question,
            packets=packets,
            mode="url-capture",
        )


class AppHandler(BaseHTTPRequestHandler):
    workbench = PolicyWorkbench()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.handle_index()
            return
        if parsed.path == "/health":
            self.send_json({"status": "ok"})
            return
        if parsed.path == "/api/runs":
            self.send_json({"runs": self.workbench.store.list_runs()})
            return
        if parsed.path == "/api/samples":
            self.send_json({"samples": sample_definitions()})
            return
        if parsed.path.startswith("/api/samples/"):
            sample_id = parsed.path.split("/")[-1]
            self.handle_get_sample(sample_id)
            return
        if parsed.path.startswith("/api/runs/"):
            run_id = parsed.path.split("/")[-1]
            self.handle_get_run(run_id)
            return
        if parsed.path.startswith("/static/"):
            self.handle_static(parsed.path.removeprefix("/static/"))
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Route not found")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/demo":
            self.handle_api(self.workbench.run_demo)
            return
        if parsed.path == "/api/analyze":
            payload = self.read_json_body()
            self.handle_api(
                lambda: self.workbench.run_from_packets(
                    policy_name=payload["policy_name"],
                    policy_question=payload["policy_question"],
                    packets=payload["packets"],
                )
            )
            return
        if parsed.path == "/api/analyze-directory":
            payload = self.read_json_body()
            self.handle_api(
                lambda: self.workbench.run_from_directory(
                    policy_name=payload["policy_name"],
                    policy_question=payload["policy_question"],
                    sources_dir=payload["sources_dir"],
                )
            )
            return
        if parsed.path == "/api/analyze-urls":
            payload = self.read_json_body()
            self.handle_api(
                lambda: self.workbench.run_from_urls(
                    policy_name=payload["policy_name"],
                    policy_question=payload["policy_question"],
                    urls=payload["urls"],
                    use_openclaw=payload.get("use_openclaw", False),
                    browser_profile=payload.get("browser_profile", "openclaw"),
                )
            )
            return
        if parsed.path == "/api/capture":
            payload = self.read_json_body()
            self.handle_api(
                lambda: {
                    "packet": build_source_packet_from_capture(
                        type(
                            "CaptureArgs",
                            (),
                            {
                                "url": payload["url"],
                                "publisher": payload.get("publisher", "Unknown"),
                                "published_at": payload.get("published_at", "Unknown"),
                                "source_tier": int(payload.get("source_tier", 3)),
                                "document_type": payload.get("document_type", "web_page"),
                                "ministry_owner": payload.get("ministry_owner", "Unknown"),
                                "sector": payload.get("sector", "Governance"),
                                "jurisdiction": payload.get("jurisdiction", "India"),
                                "title": payload.get("title"),
                                "use_openclaw": payload.get("use_openclaw", False),
                                "browser_profile": payload.get("browser_profile", "openclaw"),
                            },
                        )()
                    )
                }
            )
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Route not found")

    def handle_index(self) -> None:
        template = read_template("index.html")
        body = template.substitute(
            title="Policy Research Workbench",
        )
        encoded = body.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def handle_static(self, relative_path: str) -> None:
        path = (STATIC_DIR / relative_path).resolve()
        if not str(path).startswith(str(STATIC_DIR.resolve())) or not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "Static asset not found")
            return

        content = path.read_bytes()
        if path.suffix == ".css":
            mime = "text/css; charset=utf-8"
        elif path.suffix == ".js":
            mime = "application/javascript; charset=utf-8"
        else:
            mime = "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def handle_get_run(self, run_id: str) -> None:
        try:
            run = self.workbench.store.get_run(run_id)
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Run not found")
            return
        self.send_json(
            {
                "run_id": run.run_id,
                "id": run.run_id,
                "policy_name": run.metadata.get("policy_name", ""),
                "policy_question": run.metadata.get("policy_question", ""),
                "mode": run.metadata.get("mode", ""),
                "created_at": run.metadata.get("created_at", ""),
                "brief": run.brief,
                "brief_markdown": render_markdown_brief(run.brief),
                "extraction": run.extraction,
                "packets": run.packets,
                "selected_packets": run.packets,
            }
        )

    def handle_get_sample(self, sample_id: str) -> None:
        sample = next((item for item in sample_definitions() if item["id"] == sample_id), None)
        if not sample:
            self.send_error(HTTPStatus.NOT_FOUND, "Sample not found")
            return
        self.send_json(
            {
                "id": sample["id"],
                "policy_name": sample["policy_name"],
                "policy_question": sample["policy_question"],
                "packets": sample_packets(),
            }
        )

    def handle_api(self, operation) -> None:
        try:
            payload = operation()
        except Exception as exc:  # pragma: no cover - surfaced to UI during manual UX runs
            self.send_json(
                {
                    "error": str(exc),
                    "traceback": traceback.format_exc(limit=5),
                },
                status=HTTPStatus.BAD_REQUEST,
            )
            return
        self.send_json(payload)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw or "{}")

    def send_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, indent=2, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format: str, *args) -> None:
        return


def run_server(host: str = "127.0.0.1", port: int = 8000) -> None:
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"Policy Research Workbench running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
