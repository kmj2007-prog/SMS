from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.listing import Listing


class RecommendationRequest(BaseModel):
    destination: str

    max_commute_time: int = Field(default=40, ge=1, le=180)

    max_deposit: int | None = Field(default=None, ge=0)
    max_monthly_rent: int | None = Field(default=None, ge=0)

    min_area: float | None = Field(default=None, ge=0)
    max_area: float | None = Field(default=None, ge=0)

    room_type: Literal["원룸", "오피스텔"] | None = None

    district: str | None = None
    neighborhood: str | None = None

    candidate_limit: int = Field(default=15, ge=1, le=30)
    result_limit: int = Field(default=10, ge=1, le=20)


class ListingWithCommute(Listing):
    commute_time: int
    transfers: int
    route_type: str
    total_distance: int
    fare: int | None = None


class RecommendationResponse(BaseModel):
    destination_name: str
    destination_latitude: float
    destination_longitude: float

    searched_candidates: int
    total: int

    items: list[ListingWithCommute]