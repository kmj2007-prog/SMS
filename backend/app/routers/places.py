from fastapi import APIRouter, HTTPException, Query

from app.services.kakao_service import search_place


router = APIRouter(
    prefix="/places",
    tags=["places"],
)


@router.get("/search")
def search_place_api(
    query: str = Query(..., min_length=1),
):
    place = search_place(query)

    if place is None:
        raise HTTPException(
            status_code=404,
            detail="검색 결과가 없습니다.",
        )

    return place