from app.services.kakao_service import get_public_transit_route


def calculate_commute(
    start_latitude: float,
    start_longitude: float,
    destination_latitude: float,
    destination_longitude: float,
):
    route = get_public_transit_route(
        start_latitude=start_latitude,
        start_longitude=start_longitude,
        destination_latitude=destination_latitude,
        destination_longitude=destination_longitude,
    )

    if route is None:
        return None

    return {
        "total_time": route["total_time"],
        "transfers": route["transfers"],
        "route_type": route["route_type"],
        "total_distance": route["total_distance"],
        "fare": route["fare"],
    }