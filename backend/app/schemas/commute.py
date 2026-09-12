from pydantic import BaseModel


class CommuteRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    destination_latitude: float
    destination_longitude: float


class CommuteResponse(BaseModel):
    total_time: int
    transfers: int
    route_type: str
    total_distance: int
    fare: int | None = None