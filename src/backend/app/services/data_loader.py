"""
data_loader.py — CSV loading with module-level cache (load once at startup).
"""
from __future__ import annotations

import os
from pathlib import Path

import pandas as pd

from app.models.shipment import Shipment
from app.models.disruption import Disruption

_DATA_DIR = Path(__file__).parent.parent / "data"

_shipments: list[Shipment] | None = None
_disruptions: list[Disruption] | None = None


def _load_shipments_from_csv(path: str | None) -> list[Shipment]:
    csv_path = path or str(_DATA_DIR / "shipments.csv")
    df = pd.read_csv(csv_path, dtype=str)
    df.columns = df.columns.str.strip()
    df = df.fillna("")
    return [Shipment(**row) for row in df.to_dict(orient="records")]


def _load_disruptions_from_csv(path: str | None) -> list[Disruption]:
    csv_path = path or str(_DATA_DIR / "disruptions.csv")
    df = pd.read_csv(csv_path, dtype=str)
    df.columns = df.columns.str.strip()
    df = df.fillna("")
    df["active"] = df["active"].str.lower().map({"true": True, "false": False})
    return [Disruption(**row) for row in df.to_dict(orient="records")]


def load_shipments(path: str | None = None) -> list[Shipment]:
    """Return all shipments. Loads from CSV once and caches in memory."""
    global _shipments
    if _shipments is None:
        _shipments = _load_shipments_from_csv(path)
    return _shipments


def load_disruptions(path: str | None = None) -> list[Disruption]:
    """Return all disruptions. Loads from CSV once and caches in memory."""
    global _disruptions
    if _disruptions is None:
        _disruptions = _load_disruptions_from_csv(path)
    return _disruptions


def reload_disruptions(new_disruption: Disruption | None = None) -> list[Disruption]:
    """Reload disruptions from CSV (bypasses cache). If new_disruption is given,
    append it to the in-memory list without touching disk."""
    global _disruptions
    if new_disruption is not None:
        if _disruptions is None:
            _disruptions = _load_disruptions_from_csv(None)
        _disruptions = _disruptions + [new_disruption]
    else:
        _disruptions = _load_disruptions_from_csv(None)
    return _disruptions
