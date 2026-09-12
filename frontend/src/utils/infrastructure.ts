import { INFRA_LABELS } from '../data/infrastructure'
import type { GeoPoint, InfrastructureKind } from '../types'

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

export function formatDistanceMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  const km = meters / 1000
  return `${km < 10 ? km.toFixed(1) : Math.round(km)}km`
}

export function formatApproxDistance(meters: number): string {
  if (meters < 1000) return `약 ${Math.max(50, Math.round(meters / 10) * 10)}m`
  const km = meters / 1000
  return `약 ${km < 10 ? km.toFixed(1) : Math.round(km)}km`
}

export function formatWalkApprox(min: number): string {
  return `도보 약 ${min}분`
}

export function formatInfraSummary(priority: InfrastructureKind[]): string {
  if (priority.length === 0) return ''
  const names = priority.map((kind) => INFRA_LABELS[kind])
  if (priority.length >= 4) return `희망시설: ${names[0]} 외 ${priority.length - 1}개`
  return `희망시설: ${names.join(', ')}`
}
