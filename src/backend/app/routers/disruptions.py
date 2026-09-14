from fastapi import APIRouter

from app.models.disruption import Disruption
from app.services.data_loader import load_disruptions, reload_disruptions
from app.services.disruption_service import get_active_disruptions

router = APIRouter(prefix="/disruptions", tags=["disruptions"])


@router.get("/", response_model=list[Disruption])
def list_disruptions():
    """Return all disruptions."""
    return load_disruptions()


@router.get("/active", response_model=list[Disruption])
def active_disruptions():
    """Return only active disruptions."""
    return get_active_disruptions()


@router.post("/", response_model=Disruption, status_code=201)
def add_disruption(disruption: Disruption):
    """Add a new disruption to the in-memory store."""
    updated = reload_disruptions(new_disruption=disruption)
    return updated[-1]
