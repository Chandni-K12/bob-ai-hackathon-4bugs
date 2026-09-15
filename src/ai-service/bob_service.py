"""
bob_service.py
--------------
Thin wrapper around IBM Bob for the verify-image explanation layer.

Responsibility: take the ALREADY COMPUTED deterministic verification result
(mission_type, detected_objects, confidence, verified) and ask Bob to produce:
  - student_explanation  : 1-2 sentence plain-English feedback for the student
  - teacher_explanation  : 2-3 sentence technical note for the teacher review screen
  - needs_teacher_review : True when confidence is in the borderline band 0.70–0.80

The deterministic `verified` bool is passed IN and must never be altered here.
If Bob is unavailable, a rule-based fallback is returned so the endpoint never fails.

Credentials used:
  BOB_API_KEY      — IBM Bob inference API key (from bob.ibm.com → API Keys → Inference)
  BOB_API_ENDPOINT — IBM Bob inference base URL (default: https://api.bob.ibm.com/v1)
  WATSONX_MODEL_ID — optional model override (default: ibm/granite-3-8b-instruct)
"""

import json
import logging
import os
import re
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def _get_credentials() -> tuple[str, str, str, str]:
    """Return (api_key, project_id, endpoint_url, model_id).

    project_id is optional for Inference-scoped Bob keys (the scope is baked
    into the key). If WATSONX_PROJECT_ID is set it is included in the request
    body; otherwise the body is sent without it.
    """
    api_key = os.getenv("BOB_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")  # optional
    url = os.getenv("BOB_API_ENDPOINT", "https://us-south.ml.cloud.ibm.com")
    model_id = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")
    return (api_key, project_id, url, model_id)

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
# Bob API call — direct HTTP POST to BOB_API_ENDPOINT
# ---------------------------------------------------------------------------

def _call_bob(prompt: str) -> dict:
    """
    Call IBM Bob via direct HTTP POST to the inference endpoint.
    Returns a parsed dict with student_explanation and teacher_explanation.
    Raises on any error so the caller can fall back gracefully.
    """
    api_key, project_id, url, model_id = _get_credentials()
    body: dict = {
        "model_id": model_id,
        "input": prompt,
        "parameters": {"max_new_tokens": 400},
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
    raw: str = response.json()["results"][0]["generated_text"]

    # Strip optional markdown code fence that some model versions add
    clean = raw.strip()
    if clean.startswith("```"):
        clean = re.sub(r"^```[a-z]*\n?", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\n?```$", "", clean).strip()

    # Extract the first {...} block (model may add surrounding prose)
    match = re.search(r"\{.*?\}", clean, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in Bob output: {raw[:200]!r}")

    return json.loads(match.group())


# ---------------------------------------------------------------------------
# Fallback: rule-based explanations when Bob is unavailable
# ---------------------------------------------------------------------------

FALLBACK_EVIDENCE_DESCRIPTIONS: dict[str, str] = {
    "tree_plantation": "a healthy tree sapling planted in soil with gardening tools visible.",
    "waste_segregation": "proper separation of dry recyclable waste (paper, plastic) and wet organic scraps.",
    "water_conservation": "the water meter reading and low-flow conservation faucet in place.",
    "clean_campus": "active group cleaning activity with campus maintenance supplies.",
    "green_transport": "eco-friendly transit evidence via bicycle or dedicated walking path.",
}

def _fallback_explanations(
    mission_type: str,
    detected_objects: list[str],
    confidence: float,
    verified: bool,
) -> dict[str, str]:
    pct = f"{confidence:.0%}"
    readable = mission_type.replace("_", " ").title()
    desc = FALLBACK_EVIDENCE_DESCRIPTIONS.get(
        mission_type, f"evidence items: {', '.join(detected_objects)}."
    )
    if verified:
        student = (
            f"Great job! Your submission for '{readable}' was verified with {pct} confidence. "
            f"The image clearly shows {desc}"
        )
        teacher = (
            f"Automated check passed for '{readable}' at {pct} confidence. "
            f"Detected items: {', '.join(detected_objects)}. "
            "Evidence matches expected mission requirements."
        )
    else:
        student = (
            f"Your submission for '{readable}' could not be verified (confidence {pct}). "
            f"Please re-upload a clearer photo showing required evidence like {', '.join(detected_objects)}."
        )
        teacher = (
            f"Automated check failed for '{readable}' at {pct} confidence. "
            f"Detected items: {', '.join(detected_objects)}. "
            "Required mission evidence was not clearly identified; manual review recommended."
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

    api_key, *_ = _get_credentials()
    if not api_key:
        logger.warning("BOB_API_KEY not set — using fallback explanations for verify-image")
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
