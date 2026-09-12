from pydantic import BaseModel, Field


class CommuteRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    destination_latitude: float
    destination_longitude: float


class RoutePoint(BaseModel):
    latitude: float
    longitude: float


class RouteStep(BaseModel):
    type: str
    guidance: str | None = None
    distance: int = 0
    time: int = 0
    vehicle_name: str | None = None
    vehicle_type: str | None = None
    start_stop: str | None = None
    end_stop: str | None = None
    points: list[RoutePoint] = Field(default_factory=list)


class CommuteResponse(BaseModel):
    total_time: int
    transfers: int
    route_type: str
    total_distance: int
    fare: int | None = None
    steps: list[RouteStep] = Field(default_factory=list)