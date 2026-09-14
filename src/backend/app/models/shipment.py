from pydantic import BaseModel


class Shipment(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    carrier: str
    route: str
    status: str
    eta: str
