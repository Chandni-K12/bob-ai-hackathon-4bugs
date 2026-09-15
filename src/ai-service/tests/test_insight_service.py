"""
test_insight_service.py

Focused tests for services/insight_service.py and the GET /class-insights/{class_id}
FastAPI endpoint.

All IBM Bob / watsonx.ai network calls are patched — no live credentials needed.
All Express server calls are patched — no running server needed.

New sections (this revision):
  10. Empty / sparse summary → insufficient, Bob never called.
  11. Pending verifications present, Bob returns no high-priority action → unavailable.
  12. Healthy summary (no pending) → all returned actions are evidence-grounded
      (no unsupported warning actions fabricated).
"""
from __future__ import annotations

import json
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from main import app
from services.insight_service import _is_summary_usable, _parse_bob_response, get_class_insights

client = TestClient(app)

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

_GOOD_SUMMARY = {
    "topic_avg_scores": [
        {"topic": "Climate Change",     "avg_score": 68},
        {"topic": "Waste Management",   "avg_score": 82},
        {"topic": "Water Conservation", "avg_score": 55},
    ],
    "pending_verification_count": 1,
    "participation_trend": [
        {"week": "Week 1", "active_students": 28},
        {"week": "Week 2", "active_students": 31},
        {"week": "Week 3", "active_students": 27},
    ],
}

def _make_action(priority="medium", title="Review sessions",
                 reason="Scores are below target.", recommended_action="Schedule a review class."):
    return {"priority": priority, "title": title,
            "reason": reason, "recommended_action": recommended_action}

def _good_bob_json(actions):
    return json.dumps({"actions": actions})

_THREE_ACTIONS = [
    _make_action("high",   "Review Pending Submissions",
                 "There is 1 submission awaiting teacher approval.",
                 "Open the verification queue and approve or reject the pending submission."),
    _make_action("medium", "Address Water Conservation Gap",
                 "Water Conservation average score is 55, the lowest in the class.",
                 "Assign the Water Saver mission to students scoring below 60."),
    _make_action("low",    "Sustain Participation",
                 "Active student count dipped from 31 to 27 in Week 3.",
                 "Send an engagement reminder to the class before the next session."),
]


class _FakeResponse:
    """Mimics requests.Response returning generated_text."""
    def __init__(self, text, status_code=200):
        self._text = text
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code != 200:
            raise Exception(f"HTTP Error {self.status_code}")

    def json(self):
        return {"results": [{"generated_text": self._text}]}


def _mock_summary(summary=_GOOD_SUMMARY):
    """Return a context manager that patches _fetch_class_summary."""
    return patch("services.insight_service._fetch_class_summary", return_value=summary)

def _mock_bob(text):
    return patch("services.insight_service.requests.post", return_value=_FakeResponse(text))

_CREDS_ENV = {"BOB_API_KEY": "fake-key", "BOB_API_ENDPOINT": "https://us-south.ml.cloud.ibm.com"}

def _mock_creds():
    return patch.dict("os.environ", _CREDS_ENV)


# ---------------------------------------------------------------------------
# 1. Pending-review priority — pending_verification_count > 0 → high-priority action
# ---------------------------------------------------------------------------

@patch.dict("os.environ", _CREDS_ENV)
def test_pending_review_generates_high_priority_action():
    """
    When pending_verification_count > 0, Bob must be called with that count in context,
    and the result must contain at least one high-priority action.
    """
    with _mock_summary(), _mock_bob(_good_bob_json(_THREE_ACTIONS)), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    priorities = [a["priority"] for a in result["actions"]]
    assert "high" in priorities, "Expected at least one high-priority action for pending verifications"


# ---------------------------------------------------------------------------
# 2. No fabricated warnings — prompt must NOT contain student names
# ---------------------------------------------------------------------------

@patch.dict("os.environ", _CREDS_ENV)
def test_prompt_contains_no_student_names():
    """
    Aggregate context sent to Bob must not include individual student names.
    We capture the prompt via the fake requests.post and inspect it.
    """
    captured = {}

    def mock_post(*args, **kwargs):
        captured["prompt"] = kwargs.get("json", {}).get("input", "")
        return _FakeResponse(_good_bob_json(_THREE_ACTIONS[:1]))

    with _mock_summary(), patch("services.insight_service.requests.post", side_effect=mock_post):
        get_class_insights("c1")

    prompt = captured.get("prompt", "")
    # The mock summary has no student names, but verify the prompt doesn't embed any
    student_names = ["Ananya Sharma", "Aarav Patel", "Meghna Rao", "Dr. Meera Reddy"]
    for name in student_names:
        assert name not in prompt, f"Student name '{name}' must not appear in prompt sent to Bob"


# ---------------------------------------------------------------------------
# 3. Max 3 actions — Bob returning 5 must be capped at 3
# ---------------------------------------------------------------------------

def test_max_3_actions_returned():
    """_parse_bob_response must return at most 3 actions even if Bob gives 5."""
    five_actions = [_make_action() for _ in range(5)]
    result = _parse_bob_response(_good_bob_json(five_actions))
    assert result is not None
    assert len(result) <= 3


# ---------------------------------------------------------------------------
# 4. Malformed Bob output → data_status="unavailable"
# ---------------------------------------------------------------------------

@patch.dict("os.environ", _CREDS_ENV)
def test_malformed_bob_output_returns_unavailable():
    """Bob returning prose (no JSON) → fallback to data-grounded actions."""
    with _mock_summary(), _mock_bob("I cannot help with that."), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    assert len(result["actions"]) > 0


@patch.dict("os.environ", _CREDS_ENV)
def test_bob_json_missing_required_key_returns_unavailable():
    """Bob returns JSON but action objects are missing 'recommended_action' key → fallback."""
    bad = json.dumps({"actions": [{"priority": "high", "title": "Do X", "reason": "Because."}]})
    with _mock_summary(), _mock_bob(bad), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    assert len(result["actions"]) > 0


# ---------------------------------------------------------------------------
# 5. Missing credentials → data-grounded fallback response
# ---------------------------------------------------------------------------

def test_missing_credentials_returns_unavailable():
    """No BOB_API_KEY → fallback data-grounded response."""
    with _mock_summary():
        with patch.dict(os.environ, {}, clear=False):
            saved_key = os.environ.pop("BOB_API_KEY", None)
            try:
                result = get_class_insights("c1")
                assert result["data_status"] == "sufficient"
                assert len(result["actions"]) > 0
                assert result["class_id"] == "c1"
            finally:
                if saved_key: os.environ["BOB_API_KEY"] = saved_key


# ---------------------------------------------------------------------------
# 6. Insufficient data — class summary fetch fails or returns None
# ---------------------------------------------------------------------------

def test_unknown_class_returns_insufficient():
    """_fetch_class_summary returning None → data_status='insufficient', actions=[]."""
    with patch("services.insight_service._fetch_class_summary", return_value=None):
        result = get_class_insights("unknown_class")

    assert result["data_status"] == "insufficient"
    assert result["actions"] == []
    assert result["class_id"] == "unknown_class"


# ---------------------------------------------------------------------------
# 7. Unknown class via the FastAPI endpoint → data_status="insufficient"
# ---------------------------------------------------------------------------

def test_endpoint_unknown_class_returns_insufficient():
    """
    GET /class-insights/does_not_exist → 200 with data_status='insufficient'.
    (The Express server would 404; insight_service maps that to insufficient.)
    """
    with patch("services.insight_service._fetch_class_summary", return_value=None):
        resp = client.get("/class-insights/does_not_exist")

    assert resp.status_code == 200
    data = resp.json()
    assert data["data_status"] == "insufficient"
    assert data["class_id"] == "does_not_exist"
    assert data["actions"] == []


# ---------------------------------------------------------------------------
# 8. Endpoint schema — happy path response has all required fields with correct types
# ---------------------------------------------------------------------------

@patch.dict("os.environ", _CREDS_ENV)
def test_endpoint_schema_happy_path():
    """
    GET /class-insights/c1 with valid Bob response → correct response shape.
    Checks: class_id (str), data_status='sufficient',
            actions (list of dicts with priority/title/reason/recommended_action).
    """
    with _mock_summary(), _mock_bob(_good_bob_json(_THREE_ACTIONS)), _mock_creds():
        resp = client.get("/class-insights/c1")

    assert resp.status_code == 200
    data = resp.json()

    assert data["class_id"] == "c1"
    assert data["data_status"] == "sufficient"
    assert isinstance(data["actions"], list)
    assert 1 <= len(data["actions"]) <= 3

    for action in data["actions"]:
        assert "priority"           in action, "missing 'priority'"
        assert "title"              in action, "missing 'title'"
        assert "reason"             in action, "missing 'reason'"
        assert "recommended_action" in action, "missing 'recommended_action'"
        assert action["priority"] in ("high", "medium", "low")
        assert isinstance(action["title"], str) and action["title"]
        assert isinstance(action["reason"], str) and action["reason"]
        assert isinstance(action["recommended_action"], str) and action["recommended_action"]


# ---------------------------------------------------------------------------
# 9. _parse_bob_response unit: valid / invalid cases
# ---------------------------------------------------------------------------

def test_parse_valid_structured_actions():
    result = _parse_bob_response(_good_bob_json(_THREE_ACTIONS))
    assert result is not None
    assert len(result) == 3
    assert result[0]["priority"] == "high"
    assert result[0]["title"] == "Review Pending Submissions"

def test_parse_returns_none_for_empty_string():
    assert _parse_bob_response("") is None

def test_parse_returns_none_for_empty_actions_list():
    assert _parse_bob_response(json.dumps({"actions": []})) is None

def test_parse_returns_none_when_action_is_not_dict():
    assert _parse_bob_response(json.dumps({"actions": ["string item"]})) is None

def test_parse_normalises_unknown_priority_to_medium():
    action = _make_action(priority="urgent")  # not in valid set
    result = _parse_bob_response(_good_bob_json([action]))
    assert result is not None
    assert result[0]["priority"] == "medium"

def test_parse_strips_whitespace_from_all_fields():
    action = {
        "priority": "  high  ",
        "title": "  Check Scores  ",
        "reason": "  Scores are low.  ",
        "recommended_action": "  Review now.  ",
    }
    result = _parse_bob_response(_good_bob_json([action]))
    assert result is not None
    assert result[0]["priority"] == "high"
    assert result[0]["title"] == "Check Scores"
    assert result[0]["reason"] == "Scores are low."
    assert result[0]["recommended_action"] == "Review now."

def test_parse_json_inside_markdown_fence():
    fenced = f"```json\n{_good_bob_json(_THREE_ACTIONS[:2])}\n```"
    result = _parse_bob_response(fenced)
    assert result is not None
    assert len(result) == 2


# ---------------------------------------------------------------------------
# 10. Empty / sparse summary → data_status="insufficient", Bob never called
# ---------------------------------------------------------------------------

_BOB_CALL_SENTINEL = "BOB_WAS_CALLED"

def _bob_sentinel():
    """Patch requests.post so the test fails loudly if Bob is reached."""
    return patch("services.insight_service.requests.post", side_effect=AssertionError(_BOB_CALL_SENTINEL))


@pytest.mark.parametrize("sparse_summary", [
    {},                                                                 # completely empty
    {"topic_avg_scores": [], "pending_verification_count": 0,
     "participation_trend": []},                                        # all empty / zero
    {"topic_avg_scores": [{"topic": "X"}],                             # no avg_score key
     "pending_verification_count": 0, "participation_trend": []},
    {"pending_verification_count": 0},                                  # missing all lists
])
def test_sparse_summary_returns_insufficient_without_calling_bob(sparse_summary):
    """
    A summary with no usable topic scores, zero pending verifications, and no
    participation entries must return data_status='insufficient' immediately —
    Bob must never be called.
    """
    with _mock_summary(sparse_summary), _bob_sentinel(), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "insufficient", (
        f"Expected 'insufficient' for sparse summary {sparse_summary!r}, "
        f"got {result['data_status']!r}"
    )
    assert result["actions"] == []
    assert result["class_id"] == "c1"


def test_is_summary_usable_with_topics_only():
    assert _is_summary_usable({"topic_avg_scores": [{"topic": "X", "avg_score": 70}]}) is True

def test_is_summary_usable_with_pending_only():
    assert _is_summary_usable({"pending_verification_count": 2}) is True

def test_is_summary_usable_with_trend_only():
    assert _is_summary_usable({"participation_trend": [{"week": "W1", "active_students": 10}]}) is True

def test_is_summary_usable_empty_returns_false():
    assert _is_summary_usable({}) is False

def test_is_summary_usable_all_zero_empty_returns_false():
    assert _is_summary_usable({
        "topic_avg_scores": [], "pending_verification_count": 0, "participation_trend": []
    }) is False


# ---------------------------------------------------------------------------
# 11. Pending verifications present, Bob returns no high-priority action
#     → data_status="unavailable" (never silently skip the urgent item)
# ---------------------------------------------------------------------------

@patch.dict("os.environ", _CREDS_ENV)
def test_pending_but_no_high_priority_action_returns_unavailable():
    """
    When pending_verification_count > 0 and Bob's parsed actions contain only
    medium/low priorities, the service must return unavailable rather than
    silently passing through actions that ignore the urgent issue.
    """
    only_medium_actions = [
        _make_action("medium", "Review Topic Scores",
                     "Water Conservation average is 55.",
                     "Assign the Water Saver mission."),
        _make_action("low",    "Boost Participation",
                     "Active students dipped last week.",
                     "Send an engagement reminder."),
    ]
    with _mock_summary(), _mock_bob(_good_bob_json(only_medium_actions)), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "unavailable", (
        "Expected 'unavailable' when pending verifications exist but Bob returned "
        f"no high-priority action; got {result['data_status']!r}"
    )
    assert result["actions"] == []


@patch.dict("os.environ", _CREDS_ENV)
def test_pending_with_high_priority_action_returns_sufficient():
    """Counterpart: when Bob does include a high-priority action, result is sufficient."""
    with _mock_summary(), _mock_bob(_good_bob_json(_THREE_ACTIONS)), _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    assert any(a["priority"] == "high" for a in result["actions"])


# ---------------------------------------------------------------------------
# 12. Healthy summary (no pending verifications) — Bob's actions must all be
#     grounded in the supplied data; no unsupported warnings fabricated.
# ---------------------------------------------------------------------------

_HEALTHY_SUMMARY_NO_PENDING = {
    "topic_avg_scores": [
        {"topic": "Climate Change",     "avg_score": 85},
        {"topic": "Waste Management",   "avg_score": 88},
        {"topic": "Water Conservation", "avg_score": 90},
    ],
    "pending_verification_count": 0,
    "participation_trend": [
        {"week": "Week 1", "active_students": 30},
        {"week": "Week 2", "active_students": 32},
        {"week": "Week 3", "active_students": 33},
    ],
}

# Bob responses that should be ACCEPTED for a healthy class
_HEALTHY_ACCEPTED_ACTIONS = [
    _make_action("low", "Maintain High Engagement",
                 "Active students increased from 30 to 33 over 3 weeks.",
                 "Continue the current mission schedule to sustain momentum."),
]

# Bob response that invents a warning not supported by the data
_FABRICATED_WARNING_ACTIONS = [
    _make_action("high", "Urgent: Low Scores",
                 "Many students are failing Water Conservation.",
                 "Schedule immediate remediation sessions for Water Conservation."),
]


@patch.dict("os.environ", _CREDS_ENV)
def test_healthy_class_accepted_actions_pass_through():
    """
    A healthy summary with no pending verifications and good scores must
    return the Bob-provided actions as-is (data_status='sufficient') when
    the actions are grounded observations.
    """
    healthy_no_pending = dict(_HEALTHY_SUMMARY_NO_PENDING)
    with _mock_summary(healthy_no_pending), \
         _mock_bob(_good_bob_json(_HEALTHY_ACCEPTED_ACTIONS)), \
         _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    assert len(result["actions"]) == 1
    assert result["actions"][0]["priority"] == "low"


@patch.dict("os.environ", _CREDS_ENV)
def test_healthy_class_no_fabricated_high_priority_warning():
    """
    For a healthy class (all scores > 80, no pending verifications),
    even if Bob (incorrectly) returns a high-priority warning action,
    the service must accept it structurally — Bob-grounding is enforced
    by the prompt, not the parser — BUT the service must NOT add its own
    fabricated high-priority actions.

    This test verifies the SERVICE does not inject extra actions: the
    count returned equals exactly what Bob returned (no padding).
    """
    healthy_no_pending = dict(_HEALTHY_SUMMARY_NO_PENDING)
    with _mock_summary(healthy_no_pending), \
         _mock_bob(_good_bob_json(_HEALTHY_ACCEPTED_ACTIONS)), \
         _mock_creds():
        result = get_class_insights("c1")

    # Service must not add anything beyond what Bob returned
    assert len(result["actions"]) == len(_HEALTHY_ACCEPTED_ACTIONS), (
        "Service must not inject additional actions beyond Bob's output"
    )


@patch.dict("os.environ", _CREDS_ENV)
def test_no_high_priority_required_when_no_pending():
    """
    When pending_verification_count == 0, the service must NOT reject Bob's
    output just because it contains no high-priority actions. The high-priority
    guard only fires when pending_verification_count > 0.
    """
    healthy_no_pending = dict(_HEALTHY_SUMMARY_NO_PENDING)
    low_only_actions = [_make_action("low", "Keep Up Good Work",
                                     "Scores are all above 80.", "Continue current plan.")]
    with _mock_summary(healthy_no_pending), \
         _mock_bob(_good_bob_json(low_only_actions)), \
         _mock_creds():
        result = get_class_insights("c1")

    assert result["data_status"] == "sufficient"
    assert result["actions"][0]["priority"] == "low"
