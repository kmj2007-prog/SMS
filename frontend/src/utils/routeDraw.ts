import type { GeoPoint, Listing, RouteSegment, RouteSegmentKind } from '../types'
import { haversineMeters } from './infrastructure'

const CONNECTOR_GAP_M = 30

const SUBWAY_COLORS: Array<[string, string]> = [
  ['1호선', '#0052a4'],
  ['2호선', '#00a84d'],
  ['3호선', '#ef7c1f'],
  ['4호선', '#00a5de'],
  ['5호선', '#996cac'],
  ['6호선', '#cd7c2f'],
  ['7호선', '#747f00'],
  ['8호선', '#e6186c'],
  ['9호선', '#bb8336'],
  ['경의중앙', '#77c4a3'],
  ['수인분당', '#e0a134'],
  ['신분당', '#d4003b'],
  ['경춘', '#0c8e72'],
  ['우이신설', '#b7c452'],
]

export type DrawableKind = 'walk' | 'bus' | 'subway'

export interface DrawableLeg {
  kind: DrawableKind
  points: GeoPoint[]
  lineName?: string
  startStop?: string
  label: string
}

export function transitStrokeColor(kind: DrawableKind, lineName?: string): string {
  if (kind === 'walk') return '#2c4a6e'
  if (kind === 'bus') return '#2f6fed'
  if (lineName) {
    for (const [name, color] of SUBWAY_COLORS) {
      if (lineName.includes(name)) return color
    }
  }
  return '#6b4c9a'
}

function isDrawableKind(kind: RouteSegmentKind): kind is DrawableKind {
  return kind === 'walk' || kind === 'bus' || kind === 'subway'
}

function firstPoint(points: GeoPoint[]): GeoPoint | undefined {
  return points[0]
}

function lastPoint(points: GeoPoint[]): GeoPoint | undefined {
  return points[points.length - 1]
}

export function drawableLegsFor(building: Listing, destination: GeoPoint): DrawableLeg[] {
  const legs: DrawableLeg[] = []
  for (const segment of building.route_segments) {
    if (!isDrawableKind(segment.kind)) continue
    if (!segment.points || segment.points.length < 2) continue
    legs.push({
      kind: segment.kind,
      points: segment.points,
      lineName: segment.line_name,
      startStop: segment.start_stop,
      label: segment.line_name || segment.label,
    })
  }

  if (legs.length === 0) {
    const fallback =
      building.route_path.length >= 2 ? building.route_path : [building, destination]
    return [
      {
        kind: 'walk',
        points: fallback,
        label: '경로',
      },
    ]
  }

  const start = firstPoint(legs[0].points)
  if (start && haversineMeters(building, start) > CONNECTOR_GAP_M) {
    legs.unshift({
      kind: 'walk',
      points: [building, start],
      label: '도보',
    })
  }

  const end = lastPoint(legs[legs.length - 1].points)
  if (end && haversineMeters(end, destination) > CONNECTOR_GAP_M) {
    legs.push({
      kind: 'walk',
      points: [end, destination],
      label: '도보',
    })
  }

  return legs
}
