from pydantic import BaseModel


class Disruption(BaseModel):
    disruption_id: str
    type: str
    affected_region: str
    severity: str
    active: bool
    description: str
