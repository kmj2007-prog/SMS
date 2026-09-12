from fastapi import APIRouter, HTTPException

from app.schemas.commute import CommuteRequest, CommuteResponse
from app.services.commute_service import calculate_commute


router = APIRouter(
    prefix="/commute",
    tags=["commute"],
)


@router.post("", response_model=CommuteResponse)
def get_commute(request: CommuteRequest):
    result = calculate_commute(
        start_latitude=request.start_latitude,
        start_longitude=request.start_longitude,
        destination_latitude=request.destination_latitude,
        destination_longitude=request.destination_longitude,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="대중교통 경로를 찾을 수 없습니다.",
        )

    return result