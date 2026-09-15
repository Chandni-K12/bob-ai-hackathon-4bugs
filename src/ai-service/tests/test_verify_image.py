"""
Tests for the /verify-image endpoint.

Covers the four conditions specified in the task:
  1. Clear-pass  → verified=True,  Bob-written message (not hardcoded).
  2. Clear-fail  → verified=False, honest explanation, not invented.
  3. Borderline  → needs_teacher_review=True.
  4. Schema      → every field VerificationPage.jsx / MissionsPage.jsx would
                   need is present with the right types.

All tests that exercise the endpoint mock bob_service.explain_verification so
they run fully offline (no IBM Bob API key required).

Unit tests for bob_service internals (borderline flag, fallback) run without any
mock so they exercise the real logic.
"""

import os
import sys
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app  # noqa: E402

client = TestClient(app)


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

def _bob_pass(student_msg: str = "Well done! Your evidence was verified.",
              teacher_msg: str = "Automated check passed. All expected items detected.",
              review: bool = False) -> dict:
    return {
        "student_explanation": student_msg,
        "teacher_explanation": teacher_msg,
        "needs_teacher_review": review,
    }


def _bob_fail(student_msg: str = "Your submission could not be verified. Please resubmit a clearer photo.",
              teacher_msg: str = "Automated check failed. Expected items not detected in the image.",
              review: bool = False) -> dict:
    return {
        "student_explanation": student_msg,
        "teacher_explanation": teacher_msg,
        "needs_teacher_review": review,
    }


# ---------------------------------------------------------------------------
# Condition 1 — clear-pass returns verified=True with a Bob-written message
# ---------------------------------------------------------------------------

def test_clear_pass_verified_true_with_bob_message():
    """
    tree_plantation has a fixed confidence of 0.94 → verified=True.
    Bob provides a real explanation; message must equal student_explanation.
    """
    bob_response = _bob_pass(
        student_msg="Excellent work! Your tree plantation evidence clearly shows a sapling, soil, and gardening tools.",
        teacher_msg="Submission passed at 94% confidence. Tree sapling, Soil, and Gardening tools were all detected as expected.",
    )

    with patch("bob_service.explain_verification", return_value=bob_response) as mock_bob:
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/tree.jpg", "mission_type": "tree_plantation"},
        )

    assert resp.status_code == 200
    data = resp.json()

    # Deterministic decision is unchanged
    assert data["verified"] is True
    assert data["confidence"] == pytest.approx(0.94)
    assert "Tree sapling" in data["detected_objects"]

    # message comes from Bob, not a hardcoded string
    assert data["message"] == bob_response["student_explanation"]
    assert data["student_explanation"] == bob_response["student_explanation"]
    assert data["teacher_explanation"] == bob_response["teacher_explanation"]
    assert data["needs_teacher_review"] is False

    # Bob was called exactly once with the deterministic result
    mock_bob.assert_called_once_with(
        mission_type="tree_plantation",
        detected_objects=data["detected_objects"],
        confidence=pytest.approx(0.94),
        verified=True,
        segregation=None,
    )


# ---------------------------------------------------------------------------
# Condition 2 — clear-fail returns verified=False with an honest explanation
# ---------------------------------------------------------------------------

def test_clear_fail_verified_false_honest_explanation():
    """
    Force the unknown-mission random-confidence path to return 0.50 (< 0.70).
    Bob provides an honest explanation; verified must remain False.
    """
    bob_response = _bob_fail(
        student_msg="Your submission for this activity could not be verified — the required evidence was not clearly visible.",
        teacher_msg="Automated check failed at 50% confidence. The expected environmental activity evidence was not detected.",
    )

    # Patch random.uniform so the unknown-mission fallback produces a known low confidence
    with patch("main.random.uniform", return_value=0.50), \
         patch("bob_service.explain_verification", return_value=bob_response) as mock_bob:
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/photo.jpg", "mission_type": "unknown_activity"},
        )

    assert resp.status_code == 200
    data = resp.json()

    # Deterministic: 0.50 ≤ 0.70 → fail
    assert data["verified"] is False
    assert data["confidence"] == pytest.approx(0.50)

    # Honest explanation — message must NOT be an empty string or generic filler
    assert data["message"] == bob_response["student_explanation"]
    assert len(data["message"]) > 20
    assert data["student_explanation"] == bob_response["student_explanation"]
    assert data["teacher_explanation"] == bob_response["teacher_explanation"]

    # Bob received verified=False — it cannot invent a pass
    call_kwargs = mock_bob.call_args.kwargs
    assert call_kwargs["verified"] is False


def test_unrelated_image_verification_fails():
    """
    Uploading an off-topic or irrelevant image (e.g. pizza.jpg, car.png, random_doc.png)
    for a mission must fail verification with low confidence and clear mismatch notice.
    """
    resp = client.post(
        "/verify-image",
        json={
            "file_name": "pizza.jpg",
            "image_url": "pizza.jpg",
            "mission_type": "tree_plantation",
        },
    )

    assert resp.status_code == 200
    data = resp.json()

    assert data["verified"] is False
    assert data["confidence"] < 0.70
    assert "Unrelated Object / Topic Mismatch" in data["detected_objects"]
    assert "Verification Unsuccessful" in data["message"]


def test_notebook_page_photo_verification_fails():
    """
    Uploading a photo of a notebook page / document / notes for Tree Plantation mission
    must fail verification as off-topic evidence.
    """
    resp = client.post(
        "/verify-image",
        json={
            "file_name": "notebook_page.jpg",
            "image_url": "notebook_page.jpg",
            "mission_type": "tree_plantation",
        },
    )

    assert resp.status_code == 200
    data = resp.json()

    assert data["verified"] is False
    assert data["confidence"] < 0.70
    assert "Unrelated Object / Topic Mismatch" in data["detected_objects"]
    assert "Verification Unsuccessful" in data["message"]


# ---------------------------------------------------------------------------
# Condition 3 — borderline confidence sets needs_teacher_review=True
# ---------------------------------------------------------------------------

def test_borderline_confidence_sets_needs_teacher_review():
    """
    water_conservation has confidence 0.87 (not borderline).
    To test the borderline path at the endpoint level, patch random.uniform to
    return 0.75 for an unknown mission so both deterministic and Bob paths fire
    with a borderline value.
    """
    bob_response = _bob_pass(
        student_msg="Your submission passed, but only just — please try to capture the evidence more clearly next time.",
        teacher_msg="Confidence 75% is in the borderline band (70-80%). Manual review recommended before awarding points.",
        review=True,
    )

    with patch("main.random.uniform", return_value=0.75), \
         patch("bob_service.explain_verification", return_value=bob_response):
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/border.jpg", "mission_type": "borderline_test_mission"},
        )

    assert resp.status_code == 200
    data = resp.json()

    assert data["verified"] is True          # 0.75 > 0.70 → pass
    assert data["needs_teacher_review"] is True
    # Teacher note must reference the ambiguity
    assert data["teacher_explanation"] is not None
    assert len(data["teacher_explanation"]) > 10


# ---------------------------------------------------------------------------
# Condition 3b — borderline flag in bob_service unit (no endpoint, no mock)
# ---------------------------------------------------------------------------

def test_borderline_flag_from_bob_service_unit():
    """Unit test: bob_service.explain_verification computes the flag itself."""
    from bob_service import explain_verification

    # Ensure no API key so we get the deterministic fallback, not a real Bob call
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("BOB_API_KEY", None)
        result = explain_verification(
            mission_type="water_conservation",
            detected_objects=["Water meter", "Low-flow faucet"],
            confidence=0.75,
            verified=True,
        )

    assert result["needs_teacher_review"] is True
    assert isinstance(result["student_explanation"], str) and len(result["student_explanation"]) > 0
    assert isinstance(result["teacher_explanation"], str) and len(result["teacher_explanation"]) > 0


def test_high_confidence_not_flagged_for_review():
    """Confidence well above 0.80 must not set needs_teacher_review."""
    from bob_service import explain_verification

    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("BOB_API_KEY", None)
        result = explain_verification(
            mission_type="clean_campus",
            detected_objects=["Group activity", "Cleaning supplies", "Campus area"],
            confidence=0.96,
            verified=True,
        )

    assert result["needs_teacher_review"] is False


def test_fail_below_band_not_flagged_for_review():
    """A hard fail (confidence < 0.70) is not borderline — no review flag."""
    from bob_service import explain_verification

    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("BOB_API_KEY", None)
        result = explain_verification(
            mission_type="green_transport",
            detected_objects=["Bus"],
            confidence=0.55,
            verified=False,
        )

    assert result["needs_teacher_review"] is False
    assert isinstance(result["student_explanation"], str)
    assert isinstance(result["teacher_explanation"], str)


# ---------------------------------------------------------------------------
# Condition 4 — response schema matches what the frontends expect
# ---------------------------------------------------------------------------

REQUIRED_FIELDS = {
    # Fields both pages would consume from an API response
    "verified": bool,
    "confidence": float,
    "detected_objects": list,
    "message": str,
    # New fields
    "student_explanation": str,
    "teacher_explanation": str,
    "needs_teacher_review": bool,
}


@pytest.mark.parametrize("mission_type,expected_verified", [
    ("tree_plantation", True),
    ("waste_segregation", True),
    ("water_conservation", True),
    ("clean_campus", True),
    ("green_transport", True),
])
def test_response_schema_for_all_known_missions(mission_type, expected_verified):
    """
    Every known mission must return all required fields with correct types.
    segregation is optional (only waste_segregation populates it).
    """
    bob_response = _bob_pass()
    with patch("bob_service.explain_verification", return_value=bob_response):
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/img.jpg", "mission_type": mission_type},
        )

    assert resp.status_code == 200, f"Expected 200, got {resp.status_code} for {mission_type}"
    data = resp.json()

    for field, expected_type in REQUIRED_FIELDS.items():
        assert field in data, f"Missing field '{field}' for mission_type={mission_type}"
        assert isinstance(data[field], expected_type), (
            f"Field '{field}' expected {expected_type.__name__}, "
            f"got {type(data[field]).__name__} for mission_type={mission_type}"
        )

    assert data["verified"] is expected_verified
    # message must equal student_explanation (not a separate hardcoded string)
    assert data["message"] == data["student_explanation"]


def test_response_schema_segregation_present_for_waste_segregation():
    """waste_segregation must include the segregation dict."""
    bob_response = _bob_pass()
    with patch("bob_service.explain_verification", return_value=bob_response):
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/waste.jpg", "mission_type": "waste_segregation"},
        )

    data = resp.json()
    assert data["segregation"] is not None
    assert isinstance(data["segregation"], dict)
    assert "dry_waste" in data["segregation"]
    assert "wet_waste" in data["segregation"]


def test_response_schema_segregation_null_for_non_waste_mission():
    """Non-waste missions must return segregation=null."""
    bob_response = _bob_pass()
    with patch("bob_service.explain_verification", return_value=bob_response):
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/tree.jpg", "mission_type": "tree_plantation"},
        )

    data = resp.json()
    assert data["segregation"] is None


# ---------------------------------------------------------------------------
# Resilience — Bob unavailable must not break the endpoint
# ---------------------------------------------------------------------------

def test_bob_unavailable_fallback_preserves_verified():
    """
    When BOB_API_KEY is absent, the endpoint falls back to rule-based text.
    verified is determined by the deterministic confidence, not Bob.
    """
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("BOB_API_KEY", None)
        resp = client.post(
            "/verify-image",
            json={"image_url": "http://example.com/tree.jpg", "mission_type": "tree_plantation"},
        )

    assert resp.status_code == 200
    data = resp.json()

    assert data["verified"] is True          # 0.94 > 0.70
    assert data["confidence"] == pytest.approx(0.94)
    assert isinstance(data["message"], str) and len(data["message"]) > 0
    assert isinstance(data["student_explanation"], str) and len(data["student_explanation"]) > 0
    assert isinstance(data["teacher_explanation"], str) and len(data["teacher_explanation"]) > 0
    assert isinstance(data["needs_teacher_review"], bool)
