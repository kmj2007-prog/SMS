from pydantic import BaseModel


class Listing(BaseModel):
    id: int
    title: str

    room_type: str

    address: str
    latitude: float
    longitude: float

    deposit: int
    monthly_rent: int
    maintenance_fee: int

    area: float
    floor: int