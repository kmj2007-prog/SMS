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
    }