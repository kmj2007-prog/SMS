import { apiRequest } from './client'
import type { InfrastructureKind, InfrastructureMatch } from '../types'
import { walkMinutesFromMeters } from '../utils/infrastructure'

export interface NearbyPlaceDto {
  id: string
  name: string
  type: InfrastructureKind
  latitude: number
  longitude: number
  address: string | null
  road_address: string | null
  distance: number | null
  phone: string | null
  place_url: string | null
}

export interface NearbyInfrastructureResponseDto {
  radius: number
  items: Partial<Record<InfrastructureKind, NearbyPlaceDto | null>>
}

export function fetchNearbyInfrastructures(args: {
  latitude: number
  longitude: number
  types: InfrastructureKind[]
}) {
  const params = new URLSearchParams({
    latitude: String(args.latitude),
    longitude: String(args.longitude),
    types: args.types.join(','),
  })
  return apiRequest<NearbyInfrastructureResponseDto>(
    `/infrastructures/nearby?${params.toString()}`,
  )
}

export function toInfrastructureMatch(
  kind: InfrastructureKind,
  rank: number,
  place: NearbyPlaceDto,
): InfrastructureMatch {
  const distance_m = place.distance ?? 0
  return {
    kind,
    rank,
    distance_m,
    walk_min: walkMinutesFromMeters(distance_m),
    facility: {
      id: place.id || `${kind}-${place.latitude}-${place.longitude}`,
      title: place.name,
      kind,
      address: place.road_address || place.address || '',
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone,
      place_url: place.place_url,
    },
  }
}
