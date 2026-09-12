import requests

from app.schemas.recommendation import (
    ListingWithCommute,
    RecommendationRequest,
    RecommendationResponse,
)

from app.services.address_service import geocode_address
from app.services.commute_service import calculate_commute
from app.services.kakao_service import search_place
from app.services.listing_service import filter_listings


def recommend_listings(
    request: RecommendationRequest,
) -> RecommendationResponse | None:

    destination = search_place(request.destination)

    if destination is None:
        return None

    listings = filter_listings(
        max_deposit=request.max_deposit,
        max_monthly_rent=request.max_monthly_rent,
        min_area=request.min_area,
        max_area=request.max_area,
        room_type=request.room_type,
        district=request.district,
        neighborhood=request.neighborhood,
        sort_by="latest",
        order="desc",
    )

    candidates = []
    seen = set()

    for listing in listings:
        key = (
            listing.address,
            listing.area,
            listing.floor,
            listing.deposit,
            listing.monthly_rent,
        )

        if key in seen:
            continue

        seen.add(key)
        candidates.append(listing)

        if len(candidates) >= request.candidate_limit:
            break

    results: list[ListingWithCommute] = []

    for listing in candidates:

        try:
            coordinates = geocode_address(listing.address)

            if coordinates is None:
                continue

            commute = calculate_commute(
                start_latitude=coordinates["latitude"],
                start_longitude=coordinates["longitude"],
                destination_latitude=destination["latitude"],
                destination_longitude=destination["longitude"],
            )

        except requests.RequestException:
            continue

        if commute is None:
            continue

        if commute["total_time"] > request.max_commute_time:
            continue

        listing_data = listing.model_dump()

        listing_data["latitude"] = coordinates["latitude"]
        listing_data["longitude"] = coordinates["longitude"]

        results.append(
            ListingWithCommute(
                **listing_data,
                commute_time=commute["total_time"],
                transfers=commute["transfers"],
                route_type=commute["route_type"],
                total_distance=commute["total_distance"],
                fare=commute["fare"],
                route_steps=commute.get("steps") or [],
            )
        )

    results.sort(
        key=lambda item: (
            item.commute_time,
            item.monthly_rent,
        )
    )

    results = results[:request.result_limit]

    return RecommendationResponse(
        destination_name=destination["name"],
        destination_latitude=destination["latitude"],
        destination_longitude=destination["longitude"],
        searched_candidates=len(candidates),
        total=len(results),
        items=results,
    )