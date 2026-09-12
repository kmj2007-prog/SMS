import type { Listing, SearchConditions } from '../types'

export const DEFAULT_SEARCH: SearchConditions = {
  destination: '고려대학교',
  max_commute_min: 30,
  transport_modes: ['subway', 'bus'],
  max_monthly_rent: 60,
  room_types: ['원룸'],
}

function normalize(text: string): string {
  return text.replace(/\s/g, '').toLowerCase()
}

export function matchesDestination(buildingDest: string, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const d = normalize(buildingDest)
  return d.includes(q) || q.includes(d)
}

export function filterListings(
  listings: Listing[],
  conditions: SearchConditions,
): Listing[] {
  return listings.filter((building) => {
    if (!matchesDestination(building.destination, conditions.destination)) {
      return false
    }
    if (building.monthly_rent > conditions.max_monthly_rent) return false
    if (building.commute_min > conditions.max_commute_min) return false
    if (!conditions.room_types.includes(building.room_type)) return false
    const usesSelectedMode = building.transport_modes.some((mode) =>
      conditions.transport_modes.includes(mode),
    )
    return usesSelectedMode
  })
}
