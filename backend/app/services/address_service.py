import os
from functools import lru_cache
from pathlib import Path

import requests
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

KAKAO_ADDRESS_SEARCH_URL = (
    "https://dapi.kakao.com/v2/local/search/address.json"
)


@lru_cache(maxsize=2048)
def geocode_address(address: str):
    if not KAKAO_REST_API_KEY:
        raise RuntimeError(
            "KAKAO_REST_API_KEY를 불러오지 못했습니다."
        )

    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }

    params = {
        "query": address,
    }

    response = requests.get(
        KAKAO_ADDRESS_SEARCH_URL,
        headers=headers,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    documents = response.json().get("documents", [])

    if not documents:
        return None

    result = documents[0]

    return {
        "latitude": float(result["y"]),
        "longitude": float(result["x"]),
    }