from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

from app.services.kakao_service import search_nearest_keyword

SEARCH_RADIUS_M = 1500

INFRA_KEYWORDS = {
    "gym": "헬스장",
    "cinema": "영화관",
    "park": "공원",
    "library": "도서관",
}

VALID_TYPES = tuple(INFRA_KEYWORDS.keys())


class InfrastructureLookupError(Exception):
    pass


@lru_cache(maxsize=256)
def _nearest_cached(lat: float, lng: float, infra_type: str):
    query = INFRA_KEYWORDS[infra_type]
    place = search_nearest_keyword(
        latitude=lat,
        longitude=lng,
        query=query,
        radius=SEARCH_RADIUS_M,
    )
    if place is None:
        return None
    return {
        **place,
        "type": infra_type,
    }


def find_nearby_infrastructures(
    latitude: float,
    longitude: float,
    types: list[str],
) -> dict[str, dict | None]:
    unique = []
    for item in types:
        if item in INFRA_KEYWORDS and item not in unique:
            unique.append(item)

    lat = round(float(latitude), 5)
    lng = round(float(longitude), 5)
    results: dict[str, dict | None] = {item: None for item in unique}
    if not unique:
        return results

    failures = 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            pool.submit(_nearest_cached, lat, lng, infra_type): infra_type
            for infra_type in unique
        }
        for future, infra_type in futures.items():
            try:
                results[infra_type] = future.result()
            except Exception:
                failures += 1
                results[infra_type] = None

    if failures == len(unique):
        raise InfrastructureLookupError("kakao nearby search failed")

    return results
