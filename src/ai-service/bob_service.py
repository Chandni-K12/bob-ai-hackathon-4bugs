"""
bob_service.py
--------------
Thin wrapper around IBM Bob (watsonx.ai) for the verify-image explanation layer.

Responsibility: take the ALREADY COMPUTED deterministic verification result
(mission_type, detected_objects, confidence, verified) and ask Bob to produce:
  - student_explanation  : 1-2 sentence plain-English feedback for the student
  - teacher_explanation  : 2-3 sentence technical note for the teacher review screen
  - needs_teacher_review : True when confidence is in the borderline band 0.70–0.80

The deterministic `verified` bool is passed IN and must never be altered here.
If Bob is unavailable, a rule-based fallback is returned so the endpoint never fails.

Credentials used (same as mentor_service.py — no extra keys needed):
  WATSONX_API_KEY      — IBM Cloud API key
  WATSONX_PROJECT_ID   — watsonx.ai project ID
  WATSONX_URL          — defaults to https://us-south.ml.cloud.ibm.com
  WATSONX_MODEL_ID     — defaults to ibm/granite-3-8b-instruct
"""

import json
import logging
import os
import re
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration — reads the same WATSONX_* vars used by mentor_service.py
# ---------------------------------------------------------------------------

def _get_credentials() -> tuple[str, str, str, str]:
    """Return (api_key, project_id, url, model_id). Empty strings if not set."""
    return (
        os.getenv("WATSONX_API_KEY", ""),
        os.getenv("WATSONX_PROJECT_ID", ""),
        os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
        os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct"),
    )

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
# Bob API call — uses ibm-watsonx-ai SDK (same as mentor_service.py)
# ---------------------------------------------------------------------------

def _call_bob(prompt: str) -> dict:
    """
    Call IBM Bob via the watsonx.ai ModelInference SDK.
    Returns a parsed dict with student_explanation and teacher_explanation.
    Raises on any error so the caller can fall back gracefully.
    """
    from ibm_watsonx_ai import Credentials
    from ibm_watsonx_ai.foundation_models import ModelInference

    api_key, project_id, url, model_id = _get_credentials()
    model = ModelInference(
        model_id=model_id,
        credentials=Credentials(api_key=api_key, url=url),
        project_id=project_id,
    )
    raw: str = model.generate_text(prompt=prompt)

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

    api_key, project_id, *_ = _get_credentials()
    if not api_key or not project_id:
        logger.warning(
            "WATSONX_API_KEY or WATSONX_PROJECT_ID not set — "
            "using fallback explanations for verify-image"
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
