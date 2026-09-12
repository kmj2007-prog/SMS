import math
import os
from pathlib import Path

import requests
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

KAKAO_PLACE_SEARCH_URL = (
    "https://dapi.kakao.com/v2/local/search/keyword.json"
)

KAKAO_PUBLIC_TRANSIT_URL = (
    "https://dapi.kakao.com/v2/routing/publictraffic"
)


def search_place(query: str):
    if not KAKAO_REST_API_KEY:
        raise RuntimeError(
            "KAKAO_REST_API_KEY를 불러오지 못했습니다."
        )

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "query": query,
        "size": 5,
    }

    response = requests.get(
        KAKAO_PLACE_SEARCH_URL,
        headers=headers,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()
    documents = data.get("documents", [])

    if not documents:
        return None

    place = documents[0]

    return {
        "name": place["place_name"],
        "address": place["address_name"],
        "road_address": place["road_address_name"],
        "latitude": float(place["y"]),
        "longitude": float(place["x"]),
    }


def get_public_transit_route(
    start_latitude: float,
    start_longitude: float,
    destination_latitude: float,
    destination_longitude: float,
):
    if not KAKAO_REST_API_KEY:
        raise RuntimeError(
            "KAKAO_REST_API_KEY를 불러오지 못했습니다."
        )

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "start_x": str(start_longitude),
        "start_y": str(start_latitude),
        "end_x": str(destination_longitude),
        "end_y": str(destination_latitude),
    }

    response = requests.get(
        KAKAO_PUBLIC_TRANSIT_URL,
        headers=headers,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("status") != "OK":
        return None

    routes = data.get("routes", [])

    if not routes:
        return None

    fastest_route = min(
        routes,
        key=lambda route: route["properties"]["totalTime"],
    )

    properties = fastest_route["properties"]

    total_seconds = properties["totalTime"]
    total_minutes = math.ceil(total_seconds / 60)

    fare = properties.get("fare", {})

    return {
        "total_time": total_minutes,
        "transfers": properties["transfers"],
        "route_type": properties["type"],
        "total_distance": properties["totalDistance"],
        "fare": fare.get("value"),
        "steps": _parse_route_steps(fastest_route),
    }


def _parse_points(path: dict | None) -> list[dict]:
    points: list[dict] = []
    for pair in (path or {}).get("points") or []:
        if not isinstance(pair, (list, tuple)) or len(pair) < 2:
            continue
        points.append(
            {
                "latitude": float(pair[1]),
                "longitude": float(pair[0]),
            }
        )
    return points


def _step_type(raw_type: str, vehicle_name: str | None) -> str:
    value = (raw_type or "").strip().upper()
    if value in {"WALK", "WALKING"}:
        return "WALKING"
    if value == "SUBWAY" or "지하철" in value:
        return "SUBWAY"
    if value == "BUS" or "버스" in value:
        return "BUS"
    if vehicle_name and "호선" in vehicle_name:
        return "SUBWAY"
    if vehicle_name:
        return "BUS"
    return "WALKING"


def _parse_route_steps(route: dict) -> list[dict]:
    steps: list[dict] = []
    for step in route.get("steps") or []:
        props = step.get("properties") or {}
        vehicles = props.get("vehicles") or []
        stops = props.get("stops") or []
        vehicle = vehicles[0] if vehicles else {}
        vehicle_name = vehicle.get("name")
        points = _parse_points(step.get("path"))
        if len(points) < 2:
            continue
        steps.append(
            {
                "type": _step_type(str(props.get("type") or ""), vehicle_name),
                "guidance": props.get("guidance"),
                "distance": int(props.get("distance") or 0),
                "time": int(props.get("time") or 0),
                "vehicle_name": vehicle_name,
                "vehicle_type": vehicle.get("type"),
                "start_stop": stops[0].get("name") if stops else None,
                "end_stop": stops[-1].get("name") if len(stops) > 1 else None,
                "points": points,
            }
        )
    return steps


def search_nearest_keyword(
    latitude: float,
    longitude: float,
    query: str,
    radius: int = 1500,
):
    if not KAKAO_REST_API_KEY:
        raise RuntimeError(
            "KAKAO_REST_API_KEY를 불러오지 못했습니다."
        )

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "query": query,
        "x": str(longitude),
        "y": str(latitude),
        "radius": str(radius),
        "sort": "distance",
        "size": 5,
    }

    response = requests.get(
        KAKAO_PLACE_SEARCH_URL,
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()

    documents = response.json().get("documents") or []
    if not documents:
        return None

    place = documents[0]
    distance_raw = place.get("distance")
    try:
        distance = int(float(distance_raw)) if distance_raw not in (None, "") else None
    except (TypeError, ValueError):
        distance = None

    return {
        "id": str(place.get("id") or ""),
        "name": place.get("place_name") or query,
        "address": place.get("address_name") or None,
        "road_address": place.get("road_address_name") or None,
        "latitude": float(place["y"]),
        "longitude": float(place["x"]),
        "distance": distance,
        "phone": place.get("phone") or None,
        "place_url": place.get("place_url") or None,
    }