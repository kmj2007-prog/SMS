import requests

from fastapi import APIRouter, HTTPException

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)

from app.services.recommendation_service import recommend_listings


router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)


@router.post(
    "",
    response_model=RecommendationResponse,
)
def get_recommendations(
    request: RecommendationRequest,
):
    try:
        result = recommend_listings(request)

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="외부 지도 API 호출에 실패했습니다.",
        )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="목적지를 찾을 수 없습니다.",
        )

    return result