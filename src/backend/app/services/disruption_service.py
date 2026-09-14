"""
disruption_service.py — Deterministic logic for detecting affected shipments.
"""
from __future__ import annotations

from app.models.disruption import Disruption
from app.models.shipment import Shipment
from app.services.data_loader import load_disruptions, load_shipments


def get_active_disruptions() -> list[Disruption]:
    """Return disruptions where active is True."""
    return [d for d in load_disruptions() if d.active]


def get_affected_shipments() -> list[dict]:
    """Return shipments affected by any active disruption.

    A shipment is affected when its origin OR destination exactly matches
    the affected_region of an active disruption.

    Each result dict contains all shipment fields plus:
      - disruption_id
      - disruption_type
    """
    active = get_active_disruptions()
    shipments: list[Shipment] = load_shipments()

    # Build a fast lookup: region -> disruption
    region_to_disruption: dict[str, Disruption] = {}
    for d in active:
        region_to_disruption[d.affected_region] = d

    results: list[dict] = []
    for s in shipments:
        matched = region_to_disruption.get(s.origin) or region_to_disruption.get(s.destination)
        if matched:
            entry = s.model_dump()
            entry["disruption_id"] = matched.disruption_id
            entry["disruption_type"] = matched.type
            entry["disruption_severity"] = matched.severity
            entry["disruption_description"] = matched.description
            results.append(entry)

    return results
