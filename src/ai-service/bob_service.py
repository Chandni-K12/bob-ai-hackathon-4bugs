"""
bob_service.py
--------------
Thin wrapper around the IBM Bob inference API.

Responsibility: take the ALREADY COMPUTED deterministic verification result
(mission_type, detected_objects, confidence, verified) and ask Bob to produce:
  - student_explanation  : 1-2 sentence plain-English feedback for the student
  - teacher_explanation  : 2-3 sentence technical note for the teacher review screen
  - needs_teacher_review : True when confidence is in the borderline band 0.70–0.80

The deterministic `verified` bool is passed IN and must never be altered here.
If Bob is unavailable, a rule-based fallback is returned so the endpoint never fails.
"""

import json
import logging
import os
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Read at call-time (not module-load-time) so tests can patch os.environ freely.
def _get_api_key() -> Optional[str]:
    return os.getenv("BOB_API_KEY")

def _get_endpoint() -> str:
    return os.getenv("BOB_API_ENDPOINT", "https://api.bob.ibm.com/v1").rstrip("/")

# Confidence band that triggers manual teacher review regardless of pass/fail
_BORDERLINE_LOW = 0.70
_BORDERLINE_HIGH = 0.80

# ---------------------------------------------------------------------------
# Expected-objects reference (mirrors main.py mission_responses)
# Used both in prompts and in fallback text generation.
# ---------------------------------------------------------------------------

MISSION_EXPECTED: dict[str, list[str]] = {
    "tree_plantation": ["Tree sapling", "Soil", "Gardening tools"],
    "waste_segregation": ["Paper → Dry Waste", "Plastic → Dry Waste", "Organic Waste → Wet Waste"],
    "water_conservation": ["Water meter", "Low-flow faucet", "Collection system"],
    "clean_campus": ["Group activity", "Cleaning supplies", "Campus area"],
    "green_transport": ["Bicycle", "Walking path"],
}

# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

def _build_prompt(
    mission_type: str,
    expected_objects: list[str],
    detected_objects: list[str],
    confidence: float,
    verified: bool,
) -> str:
    verdict = "PASSED" if verified else "FAILED"
    borderline = _BORDERLINE_LOW <= confidence <= _BORDERLINE_HIGH
    borderline_note = (
        " The confidence score is borderline, so this case may need extra scrutiny."
        if borderline
        else ""
    )

    return f"""You are helping verify a student eco-mission submission for GenGreen.

Mission type: {mission_type.replace("_", " ").title()}
Expected evidence items: {", ".join(expected_objects)}
Detected items in the submitted image: {", ".join(detected_objects)}
Confidence score: {confidence:.0%}
Automated verdict: {verdict}{borderline_note}

Write two short texts:

1. STUDENT_EXPLANATION (1-2 sentences, encouraging, plain language, suitable for a school student):
   Explain what was found and whether the submission passed or needs improvement.

2. TEACHER_EXPLANATION (2-3 sentences, factual, suitable for a teacher review panel):
   Summarise what the automated check found, the confidence level, and flag any discrepancies between expected and detected items.

Respond ONLY with valid JSON in this exact format:
{{
  "student_explanation": "...",
  "teacher_explanation": "..."
}}"""


# ---------------------------------------------------------------------------
# Bob API call
# ---------------------------------------------------------------------------

def _call_bob(prompt: str) -> dict:
    """
    POST to the Bob inference chat-completions endpoint.
    Returns parsed JSON or raises on network/API error.
    """
    url = f"{_get_endpoint()}/chat/completions"
    headers = {
        "Authorization": f"Bearer {_get_api_key()}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "ibm/granite-3-8b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 256,
        "temperature": 0.3,
    }
    response = requests.post(url, headers=headers, json=payload, timeout=15)
    response.raise_for_status()
    data = response.json()
    content = data["choices"][0]["message"]["content"].strip()
    # Bob may wrap JSON in a markdown code fence — strip it
    if content.startswith("```"):
        lines = content.splitlines()
        content = "\n".join(
            l for l in lines if not l.startswith("```")
        ).strip()
    return json.loads(content)


# ---------------------------------------------------------------------------
# Fallback: rule-based explanations when Bob is unavailable
# ---------------------------------------------------------------------------

def _fallback_explanations(
    mission_type: str,
    detected_objects: list[str],
    confidence: float,
    verified: bool,
) -> dict[str, str]:
    pct = f"{confidence:.0%}"
    readable = mission_type.replace("_", " ").title()
    if verified:
        student = (
            f"Great job! Your submission for '{readable}' was verified "
            f"with {pct} confidence based on the items found in your image."
        )
        teacher = (
            f"Automated check passed for '{readable}' at {pct} confidence. "
            f"Detected items: {', '.join(detected_objects)}. "
            "No discrepancies identified."
        )
    else:
        student = (
            f"Your submission for '{readable}' could not be verified this time "
            f"(confidence {pct}). Please re-upload a clearer image showing the required evidence."
        )
        teacher = (
            f"Automated check failed for '{readable}' at {pct} confidence. "
            f"Detected items: {', '.join(detected_objects)}. "
            "Expected evidence was not clearly identified; manual review recommended."
        )
    return {"student_explanation": student, "teacher_explanation": teacher}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def explain_verification(
    mission_type: str,
    detected_objects: list[str],
    confidence: float,
    verified: bool,
    segregation: Optional[dict] = None,  # noqa: ARG001 — reserved for future use
) -> dict:
    """
    Returns:
        {
            "student_explanation": str,
            "teacher_explanation": str,
            "needs_teacher_review": bool,
        }

    Always returns a valid dict — never raises.
    The `verified` flag is not modified.
    """
    needs_review = _BORDERLINE_LOW <= confidence <= _BORDERLINE_HIGH

    if not _get_api_key():
        logger.warning(
            "BOB_API_KEY not set — using fallback explanations for verify-image"
        )
        explanations = _fallback_explanations(
            mission_type, detected_objects, confidence, verified
        )
        return {**explanations, "needs_teacher_review": needs_review}

    expected = MISSION_EXPECTED.get(
        mission_type, ["Environmental activity evidence"]
    )
    prompt = _build_prompt(
        mission_type, expected, detected_objects, confidence, verified
    )

    try:
        bob_result = _call_bob(prompt)
        student_exp = bob_result.get("student_explanation", "").strip()
        teacher_exp = bob_result.get("teacher_explanation", "").strip()

        # Guard: if Bob returns empty strings, fall back
        if not student_exp or not teacher_exp:
            raise ValueError("Bob returned empty explanation fields")

        return {
            "student_explanation": student_exp,
            "teacher_explanation": teacher_exp,
            "needs_teacher_review": needs_review,
        }

    except Exception as exc:  # noqa: BLE001
        logger.warning("Bob call failed (%s) — using fallback explanations", exc)
        explanations = _fallback_explanations(
            mission_type, detected_objects, confidence, verified
        )
        return {**explanations, "needs_teacher_review": needs_review}
