"""
test_disruption_service.py — Unit tests for disruption matching logic.
Uses mock data — does not rely on CSV files.
"""
from unittest.mock import patch

import pytest

from app.models.disruption import Disruption
from app.models.shipment import Shipment
from app.services.disruption_service import get_active_disruptions, get_affected_shipments

# ---------------------------------------------------------------------------
# Fixture data
# ---------------------------------------------------------------------------

SHIPMENTS = [
    Shipment(
        shipment_id="S1",
        origin="Rotterdam",
        destination="Singapore",
        carrier="TestCarrier",
        route="Europe-Asia",
        status="in_transit",
        eta="2025-08-10",
    ),
    Shipment(
        shipment_id="S2",
        origin="Hamburg",
        destination="New York",
        carrier="TestCarrier",
        route="Europe-Americas",
        status="delayed",
        eta="2025-08-05",
    ),
    Shipment(
        shipment_id="S3",
        origin="Tokyo",
        destination="Sydney",
        carrier="TestCarrier",
        route="Asia-Oceania",
        status="in_transit",
        eta="2025-08-20",
    ),
]

DISRUPTIONS = [
    Disruption(
        disruption_id="D1",
        type="port_closure",
        affected_region="Rotterdam",
        severity="high",
        active=True,
        description="Port strike",
    ),
    Disruption(
        disruption_id="D2",
        type="weather",
        affected_region="Hamburg",
        severity="medium",
        active=False,  # inactive — must NOT trigger matches
        description="Storm warning lifted",
    ),
    Disruption(
        disruption_id="D3",
        type="strike",
        affected_region="Singapore",
        severity="high",
        active=True,
        description="Dock strike",
    ),
]


# ---------------------------------------------------------------------------
# get_active_disruptions tests
# ---------------------------------------------------------------------------


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
def test_active_disruptions_filters_correctly(mock_load):
    active = get_active_disruptions()
    assert len(active) == 2
    assert all(d.active for d in active)


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
def test_inactive_disruptions_excluded(mock_load):
    active = get_active_disruptions()
    ids = [d.disruption_id for d in active]
    assert "D2" not in ids


# ---------------------------------------------------------------------------
# get_affected_shipments tests
# ---------------------------------------------------------------------------


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
@patch("app.services.disruption_service.load_shipments", return_value=SHIPMENTS)
def test_shipment_matched_by_origin(mock_ships, mock_dis):
    results = get_affected_shipments()
    ids = [r["shipment_id"] for r in results]
    assert "S1" in ids  # S1 origin=Rotterdam matches active D1


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
@patch("app.services.disruption_service.load_shipments", return_value=SHIPMENTS)
def test_shipment_matched_by_destination(mock_ships, mock_dis):
    results = get_affected_shipments()
    ids = [r["shipment_id"] for r in results]
    assert "S1" in ids  # S1 destination=Singapore matches active D3


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
@patch("app.services.disruption_service.load_shipments", return_value=SHIPMENTS)
def test_unaffected_shipment_not_in_results(mock_ships, mock_dis):
    results = get_affected_shipments()
    ids = [r["shipment_id"] for r in results]
    assert "S3" not in ids  # S3 origin=Tokyo, destination=Sydney — no active disruption


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
@patch("app.services.disruption_service.load_shipments", return_value=SHIPMENTS)
def test_inactive_disruption_does_not_cause_match(mock_ships, mock_dis):
    results = get_affected_shipments()
    ids = [r["shipment_id"] for r in results]
    # S2 origin=Hamburg — D2 (Hamburg) is inactive, should not match
    assert "S2" not in ids


@patch("app.services.disruption_service.load_disruptions", return_value=DISRUPTIONS)
@patch("app.services.disruption_service.load_shipments", return_value=SHIPMENTS)
def test_affected_shipment_includes_disruption_metadata(mock_ships, mock_dis):
    results = get_affected_shipments()
    s1 = next(r for r in results if r["shipment_id"] == "S1")
    assert "disruption_id" in s1
    assert "disruption_type" in s1
    assert "disruption_severity" in s1
