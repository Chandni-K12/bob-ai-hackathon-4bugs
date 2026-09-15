"""
test_mentor_service.py

Tests for services/mentor_service.py.
All IBM Bob / watsonx.ai network calls are patched — no live credentials needed.
"""
from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from services.mentor_service import (
    _UNABLE_RESPONSE_TEMPLATE,
    _parse_bob_response,
    get_personalized_recommendation,
)

# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

def _make_request(topic_scores=None, completed_lessons=None, mission_activity=None):
    """Build a minimal fake PersonalizeLearningRequest without importing main.py."""
    if topic_scores is None:
        topic_scores = [
            SimpleNamespace(topic="Water Conservation", score=45.0),
            SimpleNamespace(topic="Renewable Energy", score=72.0),
        ]
    req = SimpleNamespace(
        student_id="student_test_01",
        topic_scores=topic_scores,
        completed_lessons=completed_lessons or ["Intro to Climate"],
        mission_activity=mission_activity or ["tree_plantation"],
    )
    return req


_GOOD_BOB_JSON = json.dumps({
    "recommended_topic": "Water Conservation",
    "reason": "Your score in Water Conservation is the lowest among all topics.",
    "recommended_mission": "Water Guardian",
    "learning_style": "scenario-based",
})


# ---------------------------------------------------------------------------
# Unit tests for _parse_bob_response
# ---------------------------------------------------------------------------

def test_parse_valid_json():
    result = _parse_bob_response(_GOOD_BOB_JSON)
    assert result is not None
    assert result["recommended_topic"] == "Water Conservation"
    assert result["recommended_mission"] == "Water Guardian"
    assert result["learning_style"] == "scenario-based"


def test_parse_json_inside_markdown_fence():
    fenced = f"```json\n{_GOOD_BOB_JSON}\n```"
    result = _parse_bob_response(fenced)
    assert result is not None
    assert result["recommended_topic"] == "Water Conservation"


def test_parse_returns_none_for_empty_string():
    assert _parse_bob_response("") is None


def test_parse_returns_none_when_key_missing():
    incomplete = json.dumps({
        "recommended_topic": "Pollution",
        "reason": "Low score",
        # missing recommended_mission and learning_style
    })
    assert _parse_bob_response(incomplete) is None


def test_parse_returns_none_when_value_is_empty():
    bad = json.dumps({
        "recommended_topic": "",  # empty — invalid
        "reason": "Some reason",
        "recommended_mission": "Eco Explorer",
        "learning_style": "reading",
    })
    assert _parse_bob_response(bad) is None


def test_parse_normalises_unknown_learning_style():
    data = json.dumps({
        "recommended_topic": "Biodiversity",
        "reason": "Interesting topic.",
        "recommended_mission": "Biodiversity Explorer",
        "learning_style": "visual",  # not in valid set
    })
    result = _parse_bob_response(data)
    assert result is not None
    assert result["learning_style"] == "scenario-based"  # normalised to default


# ---------------------------------------------------------------------------
# Integration-style tests for get_personalized_recommendation
# ---------------------------------------------------------------------------

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


@patch.dict("os.environ", {
    "BOB_API_KEY": "fake-key",
    "BOB_API_ENDPOINT": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.mentor_service.requests.post", return_value=_FakeResponse(_GOOD_BOB_JSON))
def test_bob_success_returns_parsed_recommendation(mock_post):
    """Happy path: Bob returns valid JSON → all four fields are correctly parsed."""
    req = _make_request()
    result = get_personalized_recommendation(req)

    assert result["recommended_topic"] == "Water Conservation"
    assert result["reason"] == "Your score in Water Conservation is the lowest among all topics."
    assert result["recommended_mission"] == "Water Guardian"
    assert result["learning_style"] == "scenario-based"


@patch.dict("os.environ", {
    "BOB_API_KEY": "fake-key",
    "BOB_API_ENDPOINT": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.mentor_service.requests.post", side_effect=Exception("Connection timeout"))
def test_bob_network_error_returns_unable_response(mock_post):
    """Network failure → fallback response, no crash."""
    req = _make_request()
    result = get_personalized_recommendation(req)

    assert "recommended_topic" in result
    assert "reason" in result
    assert "recommended_mission" in result
    assert "learning_style" in result


@patch.dict("os.environ", {
    "BOB_API_KEY": "fake-key",
    "BOB_API_ENDPOINT": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.mentor_service.requests.post", return_value=_FakeResponse("Sorry, I cannot help."))
def test_bob_unparseable_output_returns_unable_response(mock_post):
    """Bob returns prose instead of JSON → fallback response."""
    req = _make_request()
    result = get_personalized_recommendation(req)

    assert "recommended_topic" in result
    assert "reason" in result


def test_missing_credentials_returns_unable_response():
    """No env vars set → immediate fallback response, no network call attempted."""
    with patch.dict("os.environ", {}, clear=False):
        import os
        saved_key = os.environ.pop("BOB_API_KEY", None)
        try:
            req = _make_request()
            result = get_personalized_recommendation(req)
            assert "recommended_topic" in result
            assert "reason" in result
        finally:
            if saved_key is not None:
                os.environ["BOB_API_KEY"] = saved_key


@patch.dict("os.environ", {
    "BOB_API_KEY": "fake-key",
    "BOB_API_ENDPOINT": "https://us-south.ml.cloud.ibm.com",
})
@patch("services.mentor_service.requests.post", return_value=_FakeResponse(
    json.dumps({
        "recommended_topic": "Pollution",
        "reason": "Bob's personalised suggestion.",
        "recommended_mission": "Clean Air Challenge",
        "learning_style": "mission-based",
    })
))
def test_bob_success_with_mission_based_style(mock_post):
    """Bob can return learning_style=mission-based and it is preserved."""
    req = _make_request()
    result = get_personalized_recommendation(req)
    assert result["learning_style"] == "mission-based"
    assert result["recommended_topic"] == "Pollution"
