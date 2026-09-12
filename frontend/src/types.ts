export type RoomType = '원룸' | '오피스텔'
export type TransportMode = 'subway' | 'bus' | 'walk'
export type RouteSegmentKind =
  | 'origin'
  | 'walk'
  | 'subway'
  | 'bus'
  | 'transfer'
  | 'destination'
export type InfrastructureKind = 'gym' | 'park' | 'cinema' | 'library'

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
  start_stop?: string
  points?: GeoPoint[]
}

export interface Listing {
  id: number
  title: string
  room_type: RoomType
  address: string
  latitude: number
  longitude: number
  deposit: number
  monthly_rent: number
  maintenance_fee: number | null
  area: number
  floor: number | null
  neighborhood: string
  image_url: string
  building_type: string
  built_year: number | null
  nearest_station: string
  walk_to_station_min: number | null
  destination: string
  commute_min: number
  transfer_count: number
  fare: number
  transport_modes: TransportMode[]
  route_path: GeoPoint[]
  route_segments: RouteSegment[]
  route_type?: string
  total_distance?: number
}

export interface Infrastructure {
  id: string
  title: string
  kind: InfrastructureKind
  address: string
  latitude: number
  longitude: number
  hours?: string
  description?: string
  phone?: string | null
  place_url?: string | null
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
