"""
mentor_service.py — IBM Bob call for personalised learning recommendations.

Flow:
  1. Build a compact, student-scoped context from the request.
  2. Send a focused prompt to IBM Bob via direct HTTP POST.
  3. Parse the JSON object from Bob's reply.
  4. Validate all four required fields are non-empty strings.
  5. On ANY failure (missing credentials, network error, bad JSON, missing keys)
     return a clear "service unavailable" response — never fabricate a recommendation.

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
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DEFAULT_MODEL = "ibm/granite-3-8b-instruct"
_REQUIRED_KEYS = {"recommended_topic", "reason", "recommended_mission", "learning_style"}
_VALID_LEARNING_STYLES = {"scenario-based", "mission-based", "reading"}

MISSION_MAP = {
    "Water Conservation": "Water Saver",
    "Waste Management": "Plastic-Free Week",
    "Climate Change": "Carbon Footprint Tracker",
    "Biodiversity": "Plant a Tree",
    "Renewable Energy": "Energy Audit",
}

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

def _fallback(req) -> dict:
    """Deterministic fallback logic: find topic with lowest score."""
    if not hasattr(req, "topic_scores") or not req.topic_scores:
        return dict(_UNABLE_RESPONSE_TEMPLATE)
    lowest = min(req.topic_scores, key=lambda ts: ts.score)
    mission = MISSION_MAP.get(lowest.topic, "Eco Explorer")
    return {
        "recommended_topic": lowest.topic,
        "reason": f"Your score in {lowest.topic} is {lowest.score:.0f}%, which is currently your lowest-scoring topic.",
        "recommended_mission": mission,
        "learning_style": "scenario-based",
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_personalized_recommendation(req) -> dict:
    """
    Call IBM Bob to produce a personalised learning recommendation for one student.

    Returns a dict matching PersonalizeLearningResponse fields.
    On any failure, returns deterministic fallback dict instead of
    raising an error.
    """
    # Step 1 — check credentials exist before attempting a network call
    api_key = os.environ.get("BOB_API_KEY", "")
    project_id = os.environ.get("WATSONX_PROJECT_ID", "")  # optional
    url = os.environ.get("BOB_API_ENDPOINT", "https://us-south.ml.cloud.ibm.com")
    model_id = os.environ.get("WATSONX_MODEL_ID", _DEFAULT_MODEL)

    if not api_key:
        logger.warning("BOB_API_KEY not set — returning deterministic fallback response.")
        return _fallback(req)

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
        body: dict = {
            "model_id": model_id,
            "input": prompt,
            "parameters": {"max_new_tokens": 300},
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
        logger.warning("IBM Bob call failed: %s — returning deterministic fallback response.", exc)
        return _fallback(req)

    # Step 4 — parse and validate
    parsed = _parse_bob_response(raw_text)
    if parsed is None:
        logger.warning(
            "IBM Bob returned unparseable output — returning deterministic fallback response. "
            "Raw output: %.200s", raw_text
        )
        return _fallback(req)

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
