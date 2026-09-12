from typing import Literal

from pydantic import BaseModel, Field


InfrastructureType = Literal["gym", "cinema", "park", "library"]


class NearbyPlace(BaseModel):
    id: str
    name: str
    type: InfrastructureType
    latitude: float
    longitude: float
    address: str | None = None
    road_address: str | None = None
    distance: int | None = None
    phone: str | None = None
    place_url: str | None = None


class NearbyInfrastructureResponse(BaseModel):
    radius: int
    items: dict[str, NearbyPlace | None] = Field(default_factory=dict)
