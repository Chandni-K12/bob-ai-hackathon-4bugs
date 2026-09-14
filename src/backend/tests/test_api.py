"""
test_api.py — Integration smoke tests for all API endpoints.
Reads real bundled CSV files via TestClient (no mocking).
"""
import pytest


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_get_shipments(client):
    resp = client.get("/api/shipments/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Verify shape of first item
    first = data[0]
    assert "shipment_id" in first
    assert "origin" in first
    assert "destination" in first


def test_get_disruptions(client):
    resp = client.get("/api/disruptions/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "disruption_id" in first
    assert "active" in first


def test_get_active_disruptions(client):
    resp = client.get("/api/disruptions/active")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # All returned disruptions must be active
    for d in data:
        assert d["active"] is True


def test_get_affected_shipments(client):
    resp = client.get("/api/shipments/affected")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Affected shipments must have disruption metadata
    for item in data:
        assert "disruption_id" in item
        assert "disruption_type" in item


def test_post_disruption(client):
    new_disruption = {
        "disruption_id": "DIS999",
        "type": "customs_hold",
        "affected_region": "Tokyo",
        "severity": "low",
        "active": True,
        "description": "Test disruption added via API",
    }
    resp = client.post("/api/disruptions/", json=new_disruption)
    assert resp.status_code == 201
    returned = resp.json()
    assert returned["disruption_id"] == "DIS999"
    assert returned["active"] is True
