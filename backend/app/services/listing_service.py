import csv
from functools import lru_cache
from pathlib import Path

from app.schemas.listing import Listing


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "listings.csv"


def to_int(value: str | None) -> int | None:
    if value is None or value.strip() == "":
        return None

    try:
        return int(float(value))
    except ValueError:
        return None


def to_float(value: str | None) -> float | None:
    if value is None or value.strip() == "":
        return None

    try:
        return float(value)
    except ValueError:
        return None


def classify_room_type(
    building_type: str,
    area: float,
) -> str | None:

    if building_type == "오피스텔":
        return "오피스텔"

    if building_type == "연립다세대" and area <= 40:
        return "원룸"

    return None


def make_address(row: dict[str, str]) -> str:
    district = row["자치구명"]
    neighborhood = row["법정동명"]

    main_number = to_int(row["본번"])
    sub_number = to_int(row["부번"])

    address = f"서울특별시 {district} {neighborhood}"

    if main_number is not None:
        address += f" {main_number}"

        if sub_number is not None and sub_number != 0:
            address += f"-{sub_number}"

    return address


@lru_cache(maxsize=1)
def get_all_listings() -> list[Listing]:
    listings: list[Listing] = []

    with DATA_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            if row["전월세구분"] != "월세":
                continue

            area = to_float(row["임대면적"])

            if area is None:
                continue

            building_type = row["건물용도"].strip()

            room_type = classify_room_type(
                building_type,
                area,
            )

            if room_type is None:
                continue

            deposit = to_int(row["보증금(만원)"])
            monthly_rent = to_int(row["임대료(만원)"])

            if deposit is None or monthly_rent is None:
                continue

            building_name = row["건물명"].strip()

            if building_name:
                title = building_name
            else:
                title = f"{row['법정동명']} {room_type}"

            listing = Listing(
                id=len(listings) + 1,

                title=title,
                room_type=room_type,

                address=make_address(row),

                latitude=None,
                longitude=None,

                deposit=deposit,
                monthly_rent=monthly_rent,
                maintenance_fee=None,

                area=area,
                floor=to_int(row["층"]),

                district=row["자치구명"],
                neighborhood=row["법정동명"],

                building_name=building_name or None,
                built_year=to_int(row["건축년도"]),
                building_type=building_type,

                contract_date=row["계약일"],
            )

            listings.append(listing)

    return listings


def get_listing_by_id(
    listing_id: int,
) -> Listing | None:

    listings = get_all_listings()

    for listing in listings:
        if listing.id == listing_id:
            return listing

    return None


def filter_listings(
    min_deposit: int | None = None,
    max_deposit: int | None = None,

    min_monthly_rent: int | None = None,
    max_monthly_rent: int | None = None,

    min_area: float | None = None,
    max_area: float | None = None,

    room_type: str | None = None,

    district: str | None = None,
    neighborhood: str | None = None,

    keyword: str | None = None,

    sort_by: str = "latest",
    order: str = "desc",
) -> list[Listing]:

    listings = get_all_listings()

    if min_deposit is not None:
        listings = [
            x for x in listings
            if x.deposit >= min_deposit
        ]

    if max_deposit is not None:
        listings = [
            x for x in listings
            if x.deposit <= max_deposit
        ]

    if min_monthly_rent is not None:
        listings = [
            x for x in listings
            if x.monthly_rent >= min_monthly_rent
        ]

    if max_monthly_rent is not None:
        listings = [
            x for x in listings
            if x.monthly_rent <= max_monthly_rent
        ]

    if min_area is not None:
        listings = [
            x for x in listings
            if x.area >= min_area
        ]

    if max_area is not None:
        listings = [
            x for x in listings
            if x.area <= max_area
        ]

    if room_type is not None:
        listings = [
            x for x in listings
            if x.room_type == room_type
        ]

    if district is not None:
        listings = [
            x for x in listings
            if x.district == district
        ]

    if neighborhood is not None:
        listings = [
            x for x in listings
            if x.neighborhood == neighborhood
        ]

    if keyword:
        search_word = keyword.lower().strip()

        listings = [
            x for x in listings
            if (
                search_word in x.title.lower()
                or search_word in x.address.lower()
                or (
                    x.building_name is not None
                    and search_word in x.building_name.lower()
                )
                or (
                    x.neighborhood is not None
                    and search_word in x.neighborhood.lower()
                )
            )
        ]

    sort_functions = {
        "monthly_rent": lambda x: x.monthly_rent,
        "deposit": lambda x: x.deposit,
        "area": lambda x: x.area,
        "built_year": lambda x: x.built_year or 0,
        "latest": lambda x: x.contract_date or "",
    }

    sort_function = sort_functions.get(
        sort_by,
        sort_functions["latest"],
    )

    reverse = order == "desc"

    listings = sorted(
        listings,
        key=sort_function,
        reverse=reverse,
    )

    return listings


def get_listing_options() -> dict:
    listings = get_all_listings()

    room_types = sorted({
        x.room_type
        for x in listings
    })

    districts = sorted({
        x.district
        for x in listings
        if x.district is not None
    })

    neighborhoods = sorted({
        x.neighborhood
        for x in listings
        if x.neighborhood is not None
    })

    return {
        "room_types": room_types,
        "districts": districts,
        "neighborhoods": neighborhoods,
    }