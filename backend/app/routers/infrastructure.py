from fastapi import APIRouter, HTTPException, Query

from app.schemas.infrastructure import (
    NearbyInfrastructureResponse,
    NearbyPlace,
)
from app.services.infrastructure_service import (
    SEARCH_RADIUS_M,
    VALID_TYPES,
    InfrastructureLookupError,
    find_nearby_infrastructures,
)


router = APIRouter(
    prefix="/infrastructures",
    tags=["infrastructures"],
)


@router.get("/nearby", response_model=NearbyInfrastructureResponse)
def get_nearby_infrastructures(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    types: str = Query(..., min_length=1, description="Comma-separated: gym,cinema,park,library"),
):
    requested = [item.strip() for item in types.split(",") if item.strip()]
    unknown = [item for item in requested if item not in VALID_TYPES]
    if unknown:
        raise HTTPException(
            status_code=400,
            detail="지원하지 않는 인프라 종류입니다.",
        )
    if not requested:
        raise HTTPException(
            status_code=400,
            detail="인프라 종류를 한 개 이상 선택해 주세요.",
        )

    try:
        found = find_nearby_infrastructures(latitude, longitude, requested)
    except InfrastructureLookupError:
        raise HTTPException(
            status_code=502,
            detail="주변 시설 정보를 불러오지 못했습니다.",
        )

    items: dict[str, NearbyPlace | None] = {}
    for infra_type in requested:
        place = found.get(infra_type)
        if not place:
            items[infra_type] = None
            continue
        try:
            items[infra_type] = NearbyPlace(**place)
        except Exception:
            items[infra_type] = None

    return NearbyInfrastructureResponse(radius=SEARCH_RADIUS_M, items=items)
