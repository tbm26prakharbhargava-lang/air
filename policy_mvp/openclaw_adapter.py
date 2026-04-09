from __future__ import annotations

import shutil
import subprocess


class OpenClawAdapter:
    """Tiny CLI adapter for optional OpenClaw-backed page capture."""

    def __init__(self, profile: str = "openclaw") -> None:
        self.profile = profile

    @staticmethod
    def available() -> bool:
        return shutil.which("openclaw") is not None

    def capture_snapshot(self, url: str) -> str:
        if not self.available():
            raise RuntimeError("OpenClaw CLI is not installed on this machine.")

        commands = [
            [
                "openclaw",
                "browser",
                "--browser-profile",
                self.profile,
                "start",
            ],
            [
                "openclaw",
                "browser",
                "--browser-profile",
                self.profile,
                "open",
                url,
            ],
            [
                "openclaw",
                "browser",
                "--browser-profile",
                self.profile,
                "snapshot",
                "--format",
                "aria",
            ],
        ]

        output = ""
        for command in commands:
            result = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
            output = result.stdout.strip() or output
        return output
