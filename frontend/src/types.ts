export type RoomType = '원룸' | '오피스텔'
export type TransportMode = 'subway' | 'bus' | 'walk'
export type RouteSegmentKind =
  | 'origin'
  | 'walk'
  | 'subway'
  | 'bus'
  | 'transfer'
  | 'destination'

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface RouteSegment {
  kind: RouteSegmentKind
  label: string
  duration_min?: number
  line_name?: string
  detail?: string
}

/**
 * Backend `Listing` 필드(id, title, room_type, address, latitude, longitude,
 * deposit, monthly_rent, maintenance_fee, area, floor)를 그대로 사용하고,
 * 지도·경로 UI에 필요한 필드를 확장한다.
 */
export interface Listing {
  id: number
  title: string
  room_type: RoomType
  address: string
  latitude: number
  longitude: number
  deposit: number
  monthly_rent: number
  maintenance_fee: number
  area: number
  floor: number
  neighborhood: string
  image_url: string
  building_type: string
  built_year: number
  nearest_station: string
  walk_to_station_min: number
  destination: string
  commute_min: number
  transfer_count: number
  fare: number
  transport_modes: TransportMode[]
  route_path: GeoPoint[]
  route_segments: RouteSegment[]
}

export type InfrastructureKind = 'gym' | 'park' | 'cinema' | 'library'

export interface Infrastructure {
  id: number
  title: string
  kind: InfrastructureKind
  address: string
  latitude: number
  longitude: number
  hours: string
  description?: string
}

export interface InfrastructureMatch {
  kind: InfrastructureKind
  rank: number
  facility: Infrastructure
  distance_m: number
  walk_min: number
}

export interface ScoredListing {
  listing: Listing
  score: number
  rank: number
  nearest: InfrastructureMatch[]
  badges: string[]
}

export interface VisibleInfraLink {
  fromBuilding: Listing
  match: InfrastructureMatch
}

export interface SearchConditions {
  destination: string
  max_commute_min: number
  transport_modes: TransportMode[]
  max_monthly_rent: number
  room_types: RoomType[]
  infrastructure_priority: InfrastructureKind[]
}

export interface RecentSearch {
  id: string
  destination: string
  max_commute_min: number
  max_monthly_rent: number
  transport_modes: TransportMode[]
  room_types: RoomType[]
  infrastructure_priority: InfrastructureKind[]
  searched_at: string
}

export interface UserProfile {
  name: string
  email: string
}

export interface Destination {
  name: string
  latitude: number
  longitude: number
}
