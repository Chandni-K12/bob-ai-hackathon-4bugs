"""
mentor_service.py — IBM Bob (watsonx.ai) call for personalised learning recommendations.

Flow:
  1. Build a compact, student-scoped context from the request.
  2. Send a focused prompt to IBM Bob via ModelInference.generate_text.
  3. Parse the JSON object from Bob's reply.
  4. Validate all four required fields are non-empty strings.
  5. On ANY failure (missing credentials, network error, bad JSON, missing keys)
     return a clear "service unavailable" response — never fabricate a recommendation.
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
_REQUIRED_KEYS = {"recommended_topic", "reason", "recommended_mission", "learning_style"}
_VALID_LEARNING_STYLES = {"scenario-based", "mission-based", "reading"}

_UNABLE_RESPONSE_TEMPLATE = {
    "recommended_topic": "Unable to personalise right now",
    "reason": (
        "IBM Bob is currently unavailable or returned an unexpected response. "
        "Please try again shortly."
    ),
    "recommended_mission": "Eco Explorer",
    "learning_style": "scenario-based",
}

_PROMPT_TEMPLATE = """\
You are an environmental education mentor for school students.
Given the student context below, return a JSON object with exactly these keys:
  recommended_topic   — the topic the student should study next (string)
  reason              — one sentence explaining why, addressed directly to the student (string)
  recommended_mission — the hands-on mission best matched to that topic (string)
  learning_style      — one of: scenario-based, mission-based, reading (string)

Student context:
{context_json}

Return only valid JSON. No explanation, no markdown, no text outside the JSON object.\
"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_personalized_recommendation(req) -> dict:
    """
    Call IBM Bob to produce a personalised learning recommendation for one student.

    Returns a dict matching PersonalizeLearningResponse fields.
    On any failure, returns a clear "service unavailable" dict instead of
    fabricating a recommendation.
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
        return dict(_UNABLE_RESPONSE_TEMPLATE)

    # Step 2 — build compact, student-scoped context
    context = {
        "topic_scores": [
            {"topic": ts.topic, "score": ts.score} for ts in req.topic_scores
        ],
        "completed_lessons": list(req.completed_lessons),
        "recent_mission_activity": list(req.mission_activity),
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
        return dict(_UNABLE_RESPONSE_TEMPLATE)

    # Step 4 — parse and validate
    parsed = _parse_bob_response(raw_text)
    if parsed is None:
        logger.warning(
            "IBM Bob returned unparseable output — returning service-unavailable response. "
            "Raw output: %.200s", raw_text
        )
        return dict(_UNABLE_RESPONSE_TEMPLATE)

    return parsed


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_bob_response(text: str) -> dict | None:
    """
    Extract the first JSON object from Bob's text output, validate required keys,
    and return a clean dict — or None if anything is missing or malformed.
    """
    # Find the first {...} block (Bob sometimes wraps in markdown fences)
    match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group())
    except json.JSONDecodeError:
        return None

    # All four keys must be present and non-empty strings
    for key in _REQUIRED_KEYS:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip():
            return None

    # Normalise learning_style to a known value; default to scenario-based
    style = data["learning_style"].strip().lower()
    if style not in _VALID_LEARNING_STYLES:
        style = "scenario-based"

    return {
        "recommended_topic": data["recommended_topic"].strip(),
        "reason": data["reason"].strip(),
        "recommended_mission": data["recommended_mission"].strip(),
        "learning_style": style,
    }
