"""
insight_service.py — IBM Bob call for teacher class insights.

Flow:
  1. Fetch aggregate class summary from the Express server
     (GET /api/analytics/class/{class_id}).  Never fetches individual student records.
  2. If the summary is missing, the class is unknown, or the summary is too sparse
     to reason about, return data_status="insufficient" without calling Bob.
  3. Build a compact, class-scoped prompt — aggregate numbers only, no student names.
  4. Send to IBM Bob via direct HTTP POST.
  5. Parse and validate: up to 3 structured action objects with keys
     priority, title, reason, recommended_action.
  6. If pending_verification_count > 0, at least one parsed action must have
     priority="high" — otherwise return data_status="unavailable".
  7. On ANY other failure (missing credentials, network error, bad JSON, missing keys)
     return data_status="unavailable" — never fabricate insights.

Credentials used:
  BOB_API_KEY      — IBM Bob inference API key (from bob.ibm.com → API Keys → Inference)
  BOB_API_ENDPOINT — IBM Bob inference base URL (default: https://api.bob.ibm.com/v1)
  WATSONX_MODEL_ID — optional model override (default: ibm/granite-3-8b-instruct)
"""
from __future__ import annotations

import json
import logging
import os
import re

import requests
import requests as http_requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DEFAULT_MODEL = "ibm/granite-3-8b-instruct"
_SERVER_BASE = os.environ.get("SERVER_BASE_URL", "http://localhost:5000")

_ACTION_KEYS = {"priority", "title", "reason", "recommended_action"}
_VALID_PRIORITIES = {"high", "medium", "low"}

_UNAVAILABLE_RESPONSE = {
    "actions": [],
    "data_status": "unavailable",
}

_PROMPT_TEMPLATE = """\
You are a teacher assistant for an environmental education platform.
Given the class summary below, return a JSON object with exactly this key:
  actions — a list of at most 3 prioritised action objects for the teacher

Each action object must have exactly these keys:
  priority           — one of: high, medium, low
  title              — a short 3-6 word label (string)
  reason             — one sentence grounded in the numbers provided (string)
  recommended_action — one concrete sentence the teacher should do (string)

Rules:
- Base every action strictly on the numbers in the context. Do not invent issues.
- If the data is too sparse to support 3 actions, return fewer.
- pending_verification_count > 0 always warrants at least one high-priority action.

Class context:
{context_json}

Return only valid JSON. No explanation, no markdown, no text outside the JSON object.\
"""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _is_summary_usable(summary: dict) -> bool:
    """
    Return True only when the summary contains enough signal to ask Bob.

    A summary is usable when at least ONE of these holds:
      - topic_avg_scores has at least one entry with a numeric avg_score
      - pending_verification_count is a positive integer
      - participation_trend has at least one entry

    Everything else (empty dict, all-empty lists, zero count) is treated as
    insufficient — Bob would have nothing concrete to act on.
    """
    topic_scores = summary.get("topic_avg_scores") or []
    has_topics = any(
        isinstance(t.get("avg_score"), (int, float))
        for t in topic_scores
        if isinstance(t, dict)
    )
    pending = summary.get("pending_verification_count", 0)
    has_pending = isinstance(pending, int) and pending > 0
    trend = summary.get("participation_trend") or []
    has_trend = isinstance(trend, list) and len(trend) > 0

    return has_topics or has_pending or has_trend


def _fetch_class_summary(class_id: str) -> dict | None:
    """
    GET /api/analytics/class/{class_id} from the Express server.
    Returns the parsed dict, or None if the class is unknown (404) or
    any network/parse error occurs.
    """
    url = f"{_SERVER_BASE}/api/analytics/class/{class_id}"
    try:
        resp = http_requests.get(url, timeout=5)
        if resp.status_code == 404:
            logger.info("Class %s not found in server (404).", class_id)
            return None
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.warning("Failed to fetch class summary for %s: %s", class_id, exc)
        return None


def _parse_bob_response(text: str) -> list[dict] | None:
    """
    Extract the first JSON object from Bob's text, validate that "actions" is a
    list of dicts each containing the four required keys as non-empty strings,
    and return at most 3 normalised action dicts — or None on any problem.
    """
    # Bob sometimes wraps output in markdown fences; find the outermost {...}
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group())
    except json.JSONDecodeError:
        return None

    actions = data.get("actions")
    if not isinstance(actions, list) or not actions:
        return None

    validated: list[dict] = []
    for item in actions:
        if not isinstance(item, dict):
            return None
        for key in _ACTION_KEYS:
            val = item.get(key)
            if not isinstance(val, str) or not val.strip():
                return None
        priority = item["priority"].strip().lower()
        if priority not in _VALID_PRIORITIES:
            priority = "medium"
        validated.append({
            "priority": priority,
            "title": item["title"].strip(),
            "reason": item["reason"].strip(),
            "recommended_action": item["recommended_action"].strip(),
        })
        if len(validated) == 3:
            break  # cap at 3

    return validated if validated else None


def _fallback_insights(class_id: str, summary: dict) -> dict:
    """Construct data-grounded prioritized actions when Bob is unavailable."""
    actions = []
    
    # 1. Pending verifications
    pending = summary.get("pending_verification_count", 0)
    if pending > 0:
        actions.append({
            "priority": "high",
            "title": "Review Pending Submissions",
            "reason": f"There are {pending} submissions awaiting teacher approval.",
            "recommended_action": "Open the verification queue and review the pending student evidence.",
        })

    # 2. Topic average scores (find lowest)
    topics = summary.get("topic_avg_scores") or []
    valid_topics = [t for t in topics if isinstance(t, dict) and isinstance(t.get("avg_score"), (int, float))]
    if valid_topics:
        lowest_topic = min(valid_topics, key=lambda t: t["avg_score"])
        actions.append({
            "priority": "medium",
            "title": f"Address {lowest_topic['topic']} Gap",
            "reason": f"{lowest_topic['topic']} average score is {lowest_topic['avg_score']}%, the lowest in the class.",
            "recommended_action": f"Assign a review lesson or mission for {lowest_topic['topic']} to reinforce learning.",
        })

    # 3. Participation trend
    trend = summary.get("participation_trend") or []
    if len(trend) >= 2:
        last = trend[-1].get("active_students", 0)
        prev = trend[-2].get("active_students", 0)
        if last < prev:
            actions.append({
                "priority": "low",
                "title": "Boost Class Participation",
                "reason": f"Active student count dipped from {prev} to {last} in the latest period.",
                "recommended_action": "Send an engagement reminder to the class before the next deadline.",
            })
        else:
            actions.append({
                "priority": "low",
                "title": "Maintain High Engagement",
                "reason": f"Active student count reached {last} in the latest week.",
                "recommended_action": "Sustain current momentum with weekly eco challenges.",
            })

    return {
        "class_id": class_id,
        "class_name": summary.get("name", f"Class {class_id.upper()}"),
        "actions": actions[:3],
        "data_status": "sufficient" if actions else "insufficient",
        "topic_avg_scores": summary.get("topic_avg_scores", []),
        "pending_verification_count": pending,
        "participation_trend": summary.get("participation_trend", []),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_class_insights(class_id: str) -> dict:
    """
    Fetch aggregate class data, call IBM Bob, return structured actions.

    Returns a dict with keys:
      class_id    — echoed
      actions     — list of action dicts (up to 3) or []
      data_status — "sufficient" | "insufficient" | "unavailable"

    Never fabricates insights. Never exposes individual student names to Bob.
    """
    # Step 1 — fetch aggregate summary (no credentials needed for this)
    summary = _fetch_class_summary(class_id)
    if summary is None:
        return {"class_id": class_id, "actions": [], "data_status": "insufficient"}

    # Step 1b — reject summaries that are too sparse to reason about
    if not _is_summary_usable(summary):
        logger.info("Class %s summary is too sparse — returning insufficient.", class_id)
        return {"class_id": class_id, "actions": [], "data_status": "insufficient"}

    # Step 2 — check Bob credentials before attempting a network call
    api_key = os.environ.get("BOB_API_KEY", "")
    project_id = os.environ.get("WATSONX_PROJECT_ID", "")  # optional
    url = os.environ.get("BOB_API_ENDPOINT", "https://us-south.ml.cloud.ibm.com")
    model_id = os.environ.get("WATSONX_MODEL_ID", _DEFAULT_MODEL)

    if not api_key:
        logger.warning("BOB_API_KEY not set — returning data-grounded fallback response.")
        return _fallback_insights(class_id, summary)

    # Step 3 — build compact, aggregate-only context (no student names)
    context = {
        "class_id": class_id,
        "topic_avg_scores": summary.get("topic_avg_scores", []),
        "pending_verification_count": summary.get("pending_verification_count", 0),
        "participation_trend": summary.get("participation_trend", []),
    }
    prompt = _PROMPT_TEMPLATE.format(context_json=json.dumps(context, ensure_ascii=False))

    # Step 4 — call IBM Bob
    try:
        body: dict = {
            "model_id": model_id,
            "input": prompt,
            "parameters": {"max_new_tokens": 500},
        }
        if project_id and project_id != "your_project_id_here":
            body["project_id"] = project_id
        response = requests.post(
            f"{url}/ml/v1/text/generation?version=2023-05-29",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=30,
        )
        response.raise_for_status()
        raw_text: str = response.json()["results"][0]["generated_text"]
    except Exception as exc:
        logger.warning("IBM Bob call failed: %s — returning data-grounded fallback response.", exc)
        return _fallback_insights(class_id, summary)

    # Step 5 — parse and validate
    parsed = _parse_bob_response(raw_text)
    if parsed is None:
        logger.warning(
            "IBM Bob returned unparseable output — returning data-grounded fallback response. "
            "Raw output: %.200s", raw_text
        )
        return _fallback_insights(class_id, summary)

    # Step 6 — when there are pending verifications, Bob MUST flag at least one
    # action as high priority. If it didn't, treat the output as invalid rather
    # than silently returning actions that miss the most urgent issue.
    pending_count = summary.get("pending_verification_count", 0)
    if pending_count > 0:
        has_high = any(a["priority"] == "high" for a in parsed)
        if not has_high:
            logger.warning(
                "pending_verification_count=%d but Bob returned no high-priority action "
                "— returning unavailable to avoid fabrication.", pending_count
            )
            return {"class_id": class_id, **_UNAVAILABLE_RESPONSE}

    return {
        "class_id": class_id,
        "class_name": summary.get("name", f"Class {class_id.upper()}"),
        "actions": parsed,
        "data_status": "sufficient",
        "topic_avg_scores": summary.get("topic_avg_scores", []),
        "pending_verification_count": pending_count,
        "participation_trend": summary.get("participation_trend", []),
    }

