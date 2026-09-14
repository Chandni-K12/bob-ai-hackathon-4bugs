from fastapi import APIRouter

from app.models.shipment import Shipment
from app.services.data_loader import load_shipments
from app.services.disruption_service import get_affected_shipments

router = APIRouter(prefix="/shipments", tags=["shipments"])


@router.get("/", response_model=list[Shipment])
def list_shipments():
    """Return all shipments."""
    return load_shipments()


@router.get("/affected")
def affected_shipments():
    """Return shipments currently affected by an active disruption."""
    return get_affected_shipments()
