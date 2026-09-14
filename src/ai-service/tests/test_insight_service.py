"""
test_insight_service.py

Tests for services/insight_service.py.
All IBM Bob / watsonx.ai network calls are patched — no live credentials needed.
"""
from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from services.insight_service import (
    _UNABLE_RESPONSE_TEMPLATE,
    _parse_bob_response,
    get_class_insights,
)

# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

def _make_request(
    class_id="c1",
    topic_performance=None,
    pending_verifications=None,
    participation_top3=None,
):
    """Build a minimal fake ClassInsightsRequest without importing main.py."""
    if topic_performance is None:
        topic_performance = [
            SimpleNamespace(topic="Climate Change", avg_score=68.0),
            SimpleNamespace(topic="Waste Management", avg_score=82.0),
            SimpleNamespace(topic="Water Conservation", avg_score=55.0),
        ]
    if pending_verifications is None:
        pending_verifications = [
            SimpleNamespace(student_name="Ananya Sharma", mission_title="Plant a Tree"),
        ]
    if participation_top3 is None:
        participation_top3 = [
            SimpleNamespace(name="Aarav Patel", points=2850),
            SimpleNamespace(name="Meghna Rao", points=2680),
            SimpleNamespace(name="Ananya Sharma", points=2450),
        ]
    return SimpleNamespace(
        class_id=class_id,
        topic_performance=topic_performance,
        pending_verifications=pending_verifications,
        participation_top3=participation_top3,
    )


_GOOD_BOB_JSON = json.dumps({
    "actions": [
        "Review Ananya Sharma's pending 'Plant a Tree' submission.",
        "Schedule a focused session on Water Conservation — class average is 55%.",
        "Recognise Aarav Patel and Meghna Rao publicly to sustain participation momentum.",
    ]
})


# ---------------------------------------------------------------------------
# Unit tests for _parse_bob_response
# ---------------------------------------------------------------------------

def test_parse_valid_json():
    result = _parse_bob_response(_GOOD_BOB_JSON)
    assert result is not None
    assert len(result) == 3
    assert "Ananya Sharma" in result[0]


def test_parse_json_inside_markdown_fence():
    fenced = f"```json\n{_GOOD_BOB_JSON}\n```"
    result = _parse_bob_response(fenced)
    assert result is not None
    assert len(result) == 3


def test_parse_returns_none_for_empty_string():
    assert _parse_bob_response("") is None


def test_parse_returns_none_when_actions_key_missing():
    bad = json.dumps({"summary": "No actions here."})
    assert _parse_bob_response(bad) is None


def test_parse_returns_none_when_actions_is_empty_list():
    bad = json.dumps({"actions": []})
    assert _parse_bob_response(bad) is None


def test_parse_returns_none_when_action_item_is_not_string():
    bad = json.dumps({"actions": [1, 2, 3]})
    assert _parse_bob_response(bad) is None


def test_parse_strips_whitespace_from_actions():
    padded = json.dumps({"actions": ["  Review submissions.  ", " Schedule session. "]})
    result = _parse_bob_response(padded)
    assert result is not None
    assert result[0] == "Review submissions."
    assert result[1] == "Schedule session."


# ---------------------------------------------------------------------------
# Integration-style tests for get_class_insights
# ---------------------------------------------------------------------------

class _FakeModel:
    """Mimics ModelInference.generate_text returning a fixed string."""
    def __init__(self, text):
        self._text = text

    def generate_text(self, prompt):
        return self._text


@patch.dict("os.environ", {
    "WATSONX_API_KEY": "fake-key",
    "WATSONX_PROJECT_ID": "fake-project",
    "WATSONX_URL": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.insight_service.ModelInference", return_value=_FakeModel(_GOOD_BOB_JSON))
@patch("services.insight_service.Credentials", return_value=MagicMock())
def test_bob_success_returns_actions(mock_creds, mock_model_cls):
    """Happy path: Bob returns valid JSON → actions list returned, insufficient_data False."""
    req = _make_request()
    result = get_class_insights(req)

    assert result["class_id"] == "c1"
    assert result["insufficient_data"] is False
    assert isinstance(result["actions"], list)
    assert len(result["actions"]) == 3
    assert "Ananya Sharma" in result["actions"][0]


@patch.dict("os.environ", {
    "WATSONX_API_KEY": "fake-key",
    "WATSONX_PROJECT_ID": "fake-project",
    "WATSONX_URL": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.insight_service.ModelInference", return_value=_FakeModel("Sorry, I cannot help with that."))
@patch("services.insight_service.Credentials", return_value=MagicMock())
def test_bob_unparseable_output_returns_unable_response(mock_creds, mock_model_cls):
    """Bob returns prose instead of JSON → insufficient_data True, single unavailability string."""
    req = _make_request()
    result = get_class_insights(req)

    assert result["class_id"] == "c1"
    assert result["insufficient_data"] is True
    assert isinstance(result["actions"], list)
    assert len(result["actions"]) == 1
    assert "unavailable" in result["actions"][0].lower()


@patch.dict("os.environ", {
    "WATSONX_API_KEY": "fake-key",
    "WATSONX_PROJECT_ID": "fake-project",
    "WATSONX_URL": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.insight_service.ModelInference", side_effect=Exception("Connection timeout"))
@patch("services.insight_service.Credentials", return_value=MagicMock())
def test_bob_network_error_returns_unable_response(mock_creds, mock_model_cls):
    """Network failure → clear service-unavailable response, no fabrication."""
    req = _make_request()
    result = get_class_insights(req)

    assert result["class_id"] == "c1"
    assert result["insufficient_data"] is True
    assert "unavailable" in result["actions"][0].lower()


def test_missing_credentials_returns_unable_response():
    """No env vars set → immediate service-unavailable, no network call attempted."""
    import os
    with patch.dict("os.environ", {}, clear=False):
        saved_key = os.environ.pop("WATSONX_API_KEY", None)
        saved_proj = os.environ.pop("WATSONX_PROJECT_ID", None)
        try:
            req = _make_request()
            result = get_class_insights(req)
            assert result["class_id"] == "c1"
            assert result["insufficient_data"] is True
            assert "unavailable" in result["actions"][0].lower()
        finally:
            if saved_key is not None:
                os.environ["WATSONX_API_KEY"] = saved_key
            if saved_proj is not None:
                os.environ["WATSONX_PROJECT_ID"] = saved_proj
