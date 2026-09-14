"""
insight_service.py — IBM Bob (watsonx.ai) call for teacher class insights.

Flow:
  1. Build a compact, class-scoped context from the request.
  2. Send a focused prompt to IBM Bob via ModelInference.generate_text.
  3. Parse the JSON object from Bob's reply.
  4. Validate the single required field ("actions") is a non-empty list of strings.
  5. On ANY failure (missing credentials, network error, bad JSON, missing/empty key)
     return a clear "service unavailable" response — never fabricate insights.
"""
from __future__ import annotations

import json
import logging
import os
import re

from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DEFAULT_MODEL = "ibm/granite-3-8b-instruct"

_UNABLE_ACTIONS = ["Insights unavailable — IBM Bob is currently unavailable or returned an unexpected response. Please try again shortly."]

_UNABLE_RESPONSE_TEMPLATE = {
    "actions": _UNABLE_ACTIONS,
    "insufficient_data": True,
}

_PROMPT_TEMPLATE = """\
You are a teacher assistant for an environmental education platform.
Given the class context below, return a JSON object with exactly this key:
  actions — a list of 3 to 5 short, prioritised action strings for the teacher (array of strings)

Each action must be specific and directly grounded in the data provided.
If the data is insufficient to form a specific action, say so honestly in that action string.

Class context:
{context_json}

Return only valid JSON. No explanation, no markdown, no text outside the JSON object.\
"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_class_insights(req) -> dict:
    """
    Call IBM Bob to produce a prioritised action list for a teacher, scoped to one class.

    Returns a dict with keys:
      class_id         — echoed from the request
      actions          — list of action strings (3-5 from Bob, or 1 unavailability string)
      insufficient_data — True when the fallback was returned

    On any failure, returns a clear "service unavailable" dict instead of
    fabricating insights.
    """
    # Step 1 — check credentials exist before attempting a network call
    api_key = os.environ.get("WATSONX_API_KEY", "")
    project_id = os.environ.get("WATSONX_PROJECT_ID", "")
    url = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    model_id = os.environ.get("WATSONX_MODEL_ID", _DEFAULT_MODEL)

    if not api_key or not project_id:
        logger.warning(
            "WATSONX_API_KEY or WATSONX_PROJECT_ID not set — "
            "returning service-unavailable response."
        )
        return {**_UNABLE_RESPONSE_TEMPLATE, "class_id": req.class_id}

    # Step 2 — build compact, class-scoped context
    context = {
        "class_id": req.class_id,
        "topic_performance": [
            {"topic": t.topic, "avg_score": t.avg_score}
            for t in req.topic_performance
        ],
        "pending_verifications": [
            {"student": v.student_name, "mission": v.mission_title}
            for v in req.pending_verifications
        ],
        "participation_top3": [
            {"name": p.name, "points": p.points}
            for p in req.participation_top3
        ],
    }
    prompt = _PROMPT_TEMPLATE.format(context_json=json.dumps(context, ensure_ascii=False))

    # Step 3 — call IBM Bob
    try:
        model = ModelInference(
            model_id=model_id,
            credentials=Credentials(api_key=api_key, url=url),
            project_id=project_id,
        )
        raw_text: str = model.generate_text(prompt=prompt)
    except Exception as exc:
        logger.warning("IBM Bob call failed: %s — returning service-unavailable response.", exc)
        return {**_UNABLE_RESPONSE_TEMPLATE, "class_id": req.class_id}

    # Step 4 — parse and validate
    parsed = _parse_bob_response(raw_text)
    if parsed is None:
        logger.warning(
            "IBM Bob returned unparseable output — returning service-unavailable response. "
            "Raw output: %.200s", raw_text
        )
        return {**_UNABLE_RESPONSE_TEMPLATE, "class_id": req.class_id}

    return {"class_id": req.class_id, "actions": parsed, "insufficient_data": False}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_bob_response(text: str) -> list[str] | None:
    """
    Extract the first JSON object from Bob's text output, validate that "actions"
    is a non-empty list of non-empty strings, and return that list — or None if
    anything is missing or malformed.
    """
    # Find the first {...} block (Bob sometimes wraps in markdown fences)
    match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group())
    except json.JSONDecodeError:
        return None

    actions = data.get("actions")
    if not isinstance(actions, list) or not actions:
        return None

    # Every item must be a non-empty string
    if not all(isinstance(a, str) and a.strip() for a in actions):
        return None

    return [a.strip() for a in actions]
