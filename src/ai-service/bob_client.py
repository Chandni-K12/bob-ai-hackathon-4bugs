"""Minimal wrapper around the official IBM Bob Shell CLI."""

import json
import os
import subprocess


def run_bob(prompt: str) -> str:
    """Run one non-interactive Bob prompt and return its final message.

    ``BOB_API_KEY`` is inherited by the Bob Shell process. An Inference API key
    needs no additional configuration; a General API key also needs
    ``BOB_TEAM_ID``.
    """
    if not os.getenv("BOB_API_KEY"):
        raise RuntimeError("BOB_API_KEY is not configured")

    # One line only: on Windows "bob.cmd" is a batch file, and cmd.exe can cut
    # a command line at the first newline.
    prompt = " ".join(prompt.split())

    default_command = "bob.cmd" if os.name == "nt" else "bob"
    command = [
        os.getenv("BOB_COMMAND", default_command),
        "run",
        prompt,
        "--format", "json",
        "--mode", "ask",
        "--max-turns", "1",
        "--disable-mcp",
        "--disable-subagents",
        "--accept-license",
    ]
    team_id = os.getenv("BOB_TEAM_ID", "").strip()
    if team_id:
        command.extend(["--team-id", team_id])

    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",   # Bob Shell prints UTF-8; Windows defaults to cp1252
            errors="replace",   # never crash on a stray byte
            timeout=60,
            check=False,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("Bob Shell is not installed or is not on PATH") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Bob Shell timed out") from exc

    stdout = (completed.stdout or "").strip()
    stderr = (completed.stderr or "").strip()

    if completed.returncode != 0:
        raise RuntimeError(f"Bob Shell failed: {(stderr or stdout)[:300]}")
    if not stdout:
        raise RuntimeError(f"Bob Shell returned no output (stderr: {stderr[:300]})")

    try:
        result = json.loads(stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Bob Shell did not return JSON: {stdout[:300]!r}") from exc

    reply = result.get("last_message")
    if result.get("status") != "success" or not isinstance(reply, str) or not reply.strip():
        raise RuntimeError(f"Bob Shell returned no successful response: {stdout[:300]!r}")
    return reply.strip()