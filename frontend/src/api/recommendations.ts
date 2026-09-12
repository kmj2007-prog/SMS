import { apiRequest } from './client'

export interface RecommendationRequestBody {
  destination: string
  max_commute_time: number
  max_monthly_rent?: number | null
  room_type?: '원룸' | '오피스텔' | null
  candidate_limit?: number
  result_limit?: number
}

export interface BackendListing {
  id: number
  title: string
  room_type: string
  address: string
  latitude: number | null
  longitude: number | null
  deposit: number
  monthly_rent: number
  maintenance_fee: number | null
  area: number
  floor: number | null
  district: string | null
  neighborhood: string | null
  building_name: string | null
  built_year: number | null
  building_type: string | null
  contract_date: string | null
}

export interface RoutePointDto {
  latitude: number
  longitude: number
}

export interface RouteStepDto {
  type: string
  guidance: string | null
  distance: number
  time: number
  vehicle_name: string | null
  vehicle_type: string | null
  start_stop: string | null
  end_stop: string | null
  points: RoutePointDto[]
}

export interface ListingWithCommuteDto extends BackendListing {
  commute_time: number
  transfers: number
  route_type: string
  total_distance: number
  fare: number | null
  route_steps?: RouteStepDto[]
}

export interface RecommendationResponseDto {
  destination_name: string
  destination_latitude: number
  destination_longitude: number
  searched_candidates: number
  total: number
  items: ListingWithCommuteDto[]
}

export function fetchRecommendations(body: RecommendationRequestBody) {
  return apiRequest<RecommendationResponseDto>('/recommendations', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
