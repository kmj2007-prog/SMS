import type { GeoPoint } from '../types'

export const MAP_BOUNDS = {
  west: 126.995,
  east: 127.072,
  south: 37.568,
  north: 37.648,
  width: 1680,
  height: 2160,
}

export function project(point: GeoPoint): { x: number; y: number } {
  const x =
    ((point.longitude - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) *
    MAP_BOUNDS.width
  const y =
    ((MAP_BOUNDS.north - point.latitude) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) *
    MAP_BOUNDS.height
  return { x, y }
}

export function polylinePoints(path: GeoPoint[]): string {
  return path.map((p) => {
    const { x, y } = project(p)
    return `${x},${y}`
  }).join(' ')
}
