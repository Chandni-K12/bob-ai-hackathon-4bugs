"""
test_data_loader.py — Tests for CSV data loading.
"""
import pytest

from app.models.disruption import Disruption
from app.models.shipment import Shipment
from app.services import data_loader


@pytest.fixture(autouse=True)
def reset_cache():
    """Reset module-level cache before each test."""
    data_loader._shipments = None
    data_loader._disruptions = None
    yield
    data_loader._shipments = None
    data_loader._disruptions = None


def test_load_shipments_returns_nonempty_list():
    shipments = data_loader.load_shipments()
    assert isinstance(shipments, list)
    assert len(shipments) > 0


def test_load_shipments_returns_shipment_instances():
    shipments = data_loader.load_shipments()
    for s in shipments:
        assert isinstance(s, Shipment)


def test_load_shipments_fields_populated():
    shipments = data_loader.load_shipments()
    first = shipments[0]
    assert first.shipment_id != ""
    assert first.origin != ""
    assert first.destination != ""


def test_load_disruptions_returns_nonempty_list():
    disruptions = data_loader.load_disruptions()
    assert isinstance(disruptions, list)
    assert len(disruptions) > 0


def test_load_disruptions_returns_disruption_instances():
    disruptions = data_loader.load_disruptions()
    for d in disruptions:
        assert isinstance(d, Disruption)


def test_load_disruptions_active_is_bool():
    disruptions = data_loader.load_disruptions()
    for d in disruptions:
        assert isinstance(d.active, bool)


def test_load_shipments_caches_on_second_call():
    first = data_loader.load_shipments()
    second = data_loader.load_shipments()
    assert first is second  # same list object — cache hit
