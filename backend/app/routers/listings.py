from fastapi import APIRouter

from app.schemas.listing import Listing
from app.services.listing_service import get_all_listings


router = APIRouter()


@router.get("/listings", response_model=list[Listing])
def read_listings():
    return get_all_listings()