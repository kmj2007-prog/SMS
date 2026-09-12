import type { Destination, GeoPoint, Listing, RoomType, RouteSegment, TransportMode } from '../types'
import type { ListingWithCommuteDto } from './recommendations'

function asRoomType(value: string): RoomType {
  return value === '오피스텔' ? '오피스텔' : '원룸'
}

export function modesFromRouteType(routeType: string): TransportMode[] {
  const text = routeType.toLowerCase()
  const modes: TransportMode[] = []
  if (text.includes('지하철') || text.includes('철도') || text.includes('subway')) {
    modes.push('subway')
  }
  if (text.includes('버스') || text.includes('bus')) {
    modes.push('bus')
  }
  if (text.includes('도보') || text.includes('walk')) {
    modes.push('walk')
  }
  return modes.length > 0 ? modes : ['subway', 'bus']
}

function commuteSegments(
  title: string,
  destinationName: string,
  commuteMin: number,
  transfers: number,
  routeType: string,
): RouteSegment[] {
  return [
    { kind: 'origin', label: title },
    {
      kind: routeType.includes('버스') && !routeType.includes('지하철') ? 'bus' : 'subway',
      label: routeType || '대중교통',
      duration_min: commuteMin,
      detail: transfers > 0 ? `환승 ${transfers}회` : '환승 없음',
    },
    { kind: 'destination', label: destinationName },
  ]
}

function mapRouteGeometry(
  title: string,
  destinationName: string,
  destination: GeoPoint,
  origin: GeoPoint,
  item: ListingWithCommuteDto,
): { path: GeoPoint[]; segments: RouteSegment[] } {
  const steps = item.route_steps ?? []
  if (steps.length === 0) {
    return {
      path: [origin, destination],
      segments: commuteSegments(
        title,
        destinationName,
        item.commute_time,
        item.transfers,
        item.route_type,
      ),
    }
  }

  const segments: RouteSegment[] = [{ kind: 'origin', label: title }]
  const path: GeoPoint[] = []
  for (const step of steps) {
    const kind: RouteSegment['kind'] =
      step.type === 'BUS' ? 'bus' : step.type === 'SUBWAY' ? 'subway' : 'walk'
    const points = (step.points ?? []).map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }))
    path.push(...points)
    segments.push({
      kind,
      label:
        step.vehicle_name ||
        (kind === 'walk' ? '도보' : step.guidance || '대중교통'),
      duration_min: Math.max(1, Math.ceil((step.time || 0) / 60)),
      line_name: step.vehicle_name ?? undefined,
      detail:
        step.start_stop && step.end_stop
          ? `${step.start_stop} → ${step.end_stop}`
          : (step.guidance ?? undefined),
      start_stop: step.start_stop ?? undefined,
      points,
    })
  }
  segments.push({ kind: 'destination', label: destinationName })
  return {
    path: path.length >= 2 ? path : [origin, destination],
    segments,
  }
}

export function mapRecommendedListing(
  item: ListingWithCommuteDto,
  destination: Destination,
): Listing | null {
  if (item.latitude == null || item.longitude == null) return null
  const point: GeoPoint = {
    latitude: item.latitude,
    longitude: item.longitude,
  }
  const title = item.title || item.building_name || '이름 없는 건물'
  const geometry = mapRouteGeometry(title, destination.name, destination, point, item)
  return {
    id: item.id,
    title: title,
    room_type: asRoomType(item.room_type),
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    deposit: item.deposit,
    monthly_rent: item.monthly_rent,
    maintenance_fee: item.maintenance_fee,
    area: item.area,
    floor: item.floor,
    neighborhood: item.neighborhood ?? item.district ?? '',
    image_url: '',
    building_type: item.building_type ?? '',
    built_year: item.built_year,
    nearest_station: '',
    walk_to_station_min: null,
    destination: destination.name,
    commute_min: item.commute_time,
    transfer_count: item.transfers,
    fare: item.fare ?? 0,
    transport_modes: modesFromRouteType(item.route_type),
    route_path: geometry.path,
    route_segments: geometry.segments,
    route_type: item.route_type,
    total_distance: item.total_distance,
  }
}
