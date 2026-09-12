from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.schemas.listing import (
    Listing,
    ListingListResponse,
    ListingOptionsResponse,
)

from app.services.listing_service import (
    filter_listings,
    get_listing_by_id,
    get_listing_options,
)


router = APIRouter(
    prefix="/listings",
    tags=["Listings"],
)


@router.get(
    "",
    response_model=ListingListResponse,
)
def read_listings(
    min_deposit: int | None = Query(None, ge=0),
    max_deposit: int | None = Query(None, ge=0),

    min_monthly_rent: int | None = Query(None, ge=0),
    max_monthly_rent: int | None = Query(None, ge=0),

    min_area: float | None = Query(None, ge=0),
    max_area: float | None = Query(None, ge=0),

    room_type: Literal[
        "원룸",
        "오피스텔",
    ] | None = None,

    district: str | None = None,
    neighborhood: str | None = None,

    keyword: str | None = None,

    sort_by: Literal[
        "latest",
        "monthly_rent",
        "deposit",
        "area",
        "built_year",
    ] = "latest",

    order: Literal[
        "asc",
        "desc",
    ] = "desc",

    skip: int = Query(
        0,
        ge=0,
    ),

    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
):
    listings = filter_listings(
        min_deposit=min_deposit,
        max_deposit=max_deposit,

        min_monthly_rent=min_monthly_rent,
        max_monthly_rent=max_monthly_rent,

        min_area=min_area,
        max_area=max_area,

        room_type=room_type,

        district=district,
        neighborhood=neighborhood,

        keyword=keyword,

        sort_by=sort_by,
        order=order,
    )

    total = len(listings)

    items = listings[
        skip:skip + limit
    ]

    return ListingListResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=items,
    )


@router.get(
    "/options",
    response_model=ListingOptionsResponse,
)
def read_listing_options():
    return get_listing_options()


@router.get(
    "/{listing_id}",
    response_model=Listing,
)
def read_listing(
    listing_id: int,
):
    listing = get_listing_by_id(
        listing_id
    )

    if listing is None:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    return listing