import json
from pathlib import Path

from app.schemas.listing import Listing


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "listings.json"


def get_all_listings() -> list[Listing]:
    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    return [Listing(**item) for item in data]