import { INFRASTRUCTURE, INFRA_LABELS } from '../data/infrastructure'
import type {
  GeoPoint,
  Infrastructure,
  InfrastructureKind,
  InfrastructureMatch,
  Listing,
  ScoredListing,
  VisibleInfraLink,
} from '../types'

const WEIGHTS = [4, 3, 2, 1]

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const earth = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function walkMinutesFromMeters(meters: number): number {
  return Math.max(1, Math.round(meters / 80))
}

export function formatApproxDistance(meters: number): string {
  if (meters < 1000) {
    return `약 ${Math.max(50, Math.round(meters / 10) * 10)}m`
  }
  const km = meters / 1000
  return `약 ${km < 10 ? km.toFixed(1) : Math.round(km)}km`
}

export function formatWalkApprox(min: number): string {
  return `도보 약 ${min}분`
}

export function nearestOfKind(
  building: Listing,
  kind: InfrastructureKind,
): { facility: Infrastructure; distance_m: number; walk_min: number } | null {
  const pool = INFRASTRUCTURE.filter((item) => item.kind === kind)
  if (pool.length === 0) return null
  let best = pool[0]
  let bestDist = haversineMeters(building, best)
  for (const item of pool.slice(1)) {
    const dist = haversineMeters(building, item)
    if (dist < bestDist) {
      best = item
      bestDist = dist
    }
  }
  return {
    facility: best,
    distance_m: bestDist,
    walk_min: walkMinutesFromMeters(bestDist),
  }
}

export function matchesForBuilding(
  building: Listing,
  priority: InfrastructureKind[],
): InfrastructureMatch[] {
  return priority.flatMap((kind, index) => {
    const found = nearestOfKind(building, kind)
    if (!found) return []
    return [
      {
        kind,
        rank: index + 1,
        facility: found.facility,
        distance_m: found.distance_m,
        walk_min: found.walk_min,
      },
    ]
  })
}

function proximityScore(walkMin: number): number {
  if (walkMin <= 3) return 1
  if (walkMin >= 25) return 0
  return 1 - (walkMin - 3) / 22
}

function badgesFor(item: ScoredListing, priority: InfrastructureKind[]): string[] {
  if (priority.length === 0) return []
  const badges: string[] = []
  if (item.rank === 1) badges.push('추천 1순위')
  const first = item.nearest[0]
  if (first && first.walk_min <= 5) {
    badges.push(`${INFRA_LABELS[first.kind]} 도보 ${first.walk_min}분`)
  }
  if (
    item.nearest.length >= 2 &&
    item.nearest.every((match) => match.walk_min <= 10)
  ) {
    badges.push(`선택한 시설 ${item.nearest.length}종 모두 도보 10분 이내`)
  } else if (item.score >= 70 && !badges.includes('추천 1순위')) {
    badges.push('희망시설 접근성 우수')
  }
  return badges.slice(0, 2)
}

export function rankListings(
  listings: Listing[],
  priority: InfrastructureKind[],
): ScoredListing[] {
  if (priority.length === 0) {
    return listings.map((listing, index) => ({
      listing,
      score: 0,
      rank: index + 1,
      nearest: [],
      badges: [],
    }))
  }

  const weightSum = WEIGHTS.slice(0, priority.length).reduce((a, b) => a + b, 0)
  const raw = listings.map((listing) => {
    const nearest = matchesForBuilding(listing, priority)
    const weighted = nearest.reduce((sum, match) => {
      const weight = WEIGHTS[match.rank - 1] ?? 1
      return sum + proximityScore(match.walk_min) * weight
    }, 0)
    const score = Math.round((100 * weighted) / weightSum)
    return { listing, score, nearest, rank: 0, badges: [] as string[] }
  })

  raw.sort(
    (a, b) =>
      b.score - a.score ||
      a.listing.commute_min - b.listing.commute_min ||
      a.listing.monthly_rent - b.listing.monthly_rent,
  )

  return raw.map((item, index) => {
    const ranked = { ...item, rank: index + 1 }
    return { ...ranked, badges: badgesFor(ranked, priority) }
  })
}

export function getVisibleInfrastructure(args: {
  hasSearched: boolean
  priority: InfrastructureKind[]
  scoredResults: ScoredListing[]
  selectedBuildingId: number | null
  hoveredBuildingId: number | null
  selectedListing: Listing | null
  hoveredListing: Listing | null
}): VisibleInfraLink[] {
  const {
    hasSearched,
    priority,
    scoredResults,
    selectedBuildingId,
    hoveredBuildingId,
    selectedListing,
    hoveredListing,
  } = args
  if (!hasSearched || priority.length === 0) return []

  const byId = new Map(scoredResults.map((item) => [item.listing.id, item]))

  const linksFor = (listing: Listing, kinds: InfrastructureKind[]): VisibleInfraLink[] => {
    const scored = byId.get(listing.id)
    const nearest = scored?.nearest ?? matchesForBuilding(listing, kinds)
    return nearest.map((match) => ({ fromBuilding: listing, match }))
  }

  if (selectedBuildingId != null && selectedListing) {
    return linksFor(selectedListing, priority)
  }

  if (hoveredBuildingId != null && hoveredListing) {
    const all = linksFor(hoveredListing, priority)
    return all.slice(0, 1)
  }

  const preview: VisibleInfraLink[] = []
  const used = new Set<number>()
  for (const item of scoredResults.slice(0, 3)) {
    const first = item.nearest[0]
    if (!first || used.has(first.facility.id)) continue
    used.add(first.facility.id)
    preview.push({ fromBuilding: item.listing, match: first })
  }
  return preview
}

export function formatInfraSummary(priority: InfrastructureKind[]): string {
  if (priority.length === 0) return ''
  const names = priority.map((kind) => INFRA_LABELS[kind])
  if (priority.length >= 4) return `희망시설: ${names[0]} 외 ${priority.length - 1}개`
  return `희망시설: ${names.join(' > ')}`
}

export function formatRankLine(priority: InfrastructureKind[]): string {
  return priority
    .map((kind, index) => `${index + 1}순위 ${INFRA_LABELS[kind]}`)
    .join(' · ')
}
