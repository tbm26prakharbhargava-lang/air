from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "run"


@dataclass
class StoredRun:
    run_id: str
    run_dir: Path
    metadata: dict[str, Any]
    brief: dict[str, Any]
    extraction: dict[str, Any]
    packets: list[dict[str, Any]]
    selected_packets: list[dict[str, Any]]


class RunStore:
    def __init__(self, base_dir: str | Path = "data/runs") -> None:
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def list_runs(self) -> list[dict[str, Any]]:
        runs = []
        for metadata_path in sorted(self.base_dir.glob("*/metadata.json"), reverse=True):
            with metadata_path.open(encoding="utf-8") as handle:
                metadata = json.load(handle)
            runs.append(metadata)
        return runs

    def get_run(self, run_id: str) -> StoredRun:
        run_dir = self.base_dir / run_id
        if not run_dir.exists():
            raise FileNotFoundError(f"Run {run_id} not found")

        def load_json(name: str) -> Any:
            with (run_dir / name).open(encoding="utf-8") as handle:
                return json.load(handle)

        return StoredRun(
            run_id=run_id,
            run_dir=run_dir,
            metadata=load_json("metadata.json"),
            brief=load_json("brief.json"),
            extraction=load_json("extraction.json"),
            packets=load_json("packets.json"),
            selected_packets=load_json("selected_packets.json")
            if (run_dir / "selected_packets.json").exists()
            else load_json("packets.json"),
        )

    def save_run(
        self,
        *,
        policy_name: str,
        policy_question: str,
        mode: str,
        packets: list[dict[str, Any]],
        selected_packets: list[dict[str, Any]],
        brief: dict[str, Any],
        extraction: dict[str, Any],
    ) -> str:
        existing = len(list(self.base_dir.glob("*")))
        run_id = f"{existing + 1:03d}-{slugify(policy_name)[:48]}"
        run_dir = self.base_dir / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        metadata = {
            "run_id": run_id,
            "policy_name": policy_name,
            "policy_question": policy_question,
            "mode": mode,
            "created_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
            "packet_count": len(packets),
            "verdict_confidence": brief.get("verdict_confidence", "UNKNOWN"),
            "source_count": len(brief.get("source_register", [])),
        }

        self._write_json(run_dir / "metadata.json", metadata)
        self._write_json(run_dir / "brief.json", brief)
        self._write_json(run_dir / "extraction.json", extraction)
        self._write_json(run_dir / "packets.json", packets)
        self._write_json(run_dir / "selected_packets.json", selected_packets)
        return run_id

    @staticmethod
    def _write_json(path: Path, payload: Any) -> None:
        with path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2, ensure_ascii=True)
            handle.write("\n")
