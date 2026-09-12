import type { SearchConditions } from '../types'
import type { RecommendationRequestBody } from './recommendations'
import { fetchRecommendations } from './recommendations'
import { mapRecommendedListing } from './mappers'

export function toRecommendationRequest(
  conditions: SearchConditions,
): RecommendationRequestBody {
  return {
    destination: conditions.destination.trim(),
    max_commute_time: conditions.max_commute_min,
    max_monthly_rent: conditions.max_monthly_rent,
    room_type: conditions.room_types.length === 1 ? conditions.room_types[0] : null,
    candidate_limit: 20,
    result_limit: 15,
  }
}

export async function searchBuildings(conditions: SearchConditions) {
  const data = await fetchRecommendations(toRecommendationRequest(conditions))
  const destination = {
    name: data.destination_name,
    latitude: data.destination_latitude,
    longitude: data.destination_longitude,
  }
  const listings = data.items
    .map((item) => mapRecommendedListing(item, destination))
    .filter((item): item is NonNullable<typeof item> => item != null)
  return { destination, listings, total: data.total }
}
