from pydantic import BaseModel


class Listing(BaseModel):
    id: int
    title: str
    room_type: str

    address: str

    latitude: float | None = None
    longitude: float | None = None

    deposit: int
    monthly_rent: int
    maintenance_fee: int | None = None

    area: float
    floor: int | None = None

    district: str | None = None
    neighborhood: str | None = None

    building_name: str | None = None
    built_year: int | None = None
    building_type: str | None = None

    contract_date: str | None = None


class ListingListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[Listing]


class ListingOptionsResponse(BaseModel):
    room_types: list[str]
    districts: list[str]
    neighborhoods: list[str]