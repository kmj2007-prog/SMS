import type { Destination, GeoPoint } from '../types'

export const KOREA_UNIV: Destination = {
  name: '고려대학교',
  latitude: 37.5896,
  longitude: 127.0327,
}

export const DESTINATIONS: Destination[] = [
  { name: '고려대학교', latitude: 37.5896, longitude: 127.0327 },
  { name: '성신여자대학교', latitude: 37.5924, longitude: 127.0164 },
  { name: '서울시립대학교', latitude: 37.5834, longitude: 127.0578 },
  { name: '경희대학교', latitude: 37.5961, longitude: 127.0526 },
]

export const DESTINATION_OPTIONS = DESTINATIONS.map((item) => item.name)

export function findDestination(query: string): Destination {
  const q = query.replace(/\s/g, '')
  return (
    DESTINATIONS.find((item) => {
      const name = item.name.replace(/\s/g, '')
      return name.includes(q) || q.includes(name)
    }) ?? DESTINATIONS[0]
  )
}

export const STATIONS: Array<GeoPoint & { name: string; line: string }> = [
  { name: '안암', latitude: 37.5863, longitude: 127.0292, line: '6' },
  { name: '고려대', latitude: 37.5907, longitude: 127.0365, line: '6' },
  { name: '보문', latitude: 37.5858, longitude: 127.0194, line: '6' },
  { name: '월곡', latitude: 37.6019, longitude: 127.0416, line: '6' },
  { name: '신설동', latitude: 37.5753, longitude: 127.0248, line: '1' },
  { name: '청량리', latitude: 37.5802, longitude: 127.045, line: '1' },
  { name: '회기', latitude: 37.5895, longitude: 127.0579, line: '1' },
  { name: '성신여대입구', latitude: 37.5926, longitude: 127.0165, line: '4' },
  { name: '한성대입구', latitude: 37.5884, longitude: 127.0062, line: '4' },
  { name: '길음', latitude: 37.6034, longitude: 127.0251, line: '4' },
  { name: '미아사거리', latitude: 37.6133, longitude: 127.03, line: '4' },
  { name: '미아', latitude: 37.6265, longitude: 127.026, line: '4' },
  { name: '수유', latitude: 37.638, longitude: 127.0256, line: '4' },
]

export const NEIGHBORHOODS: Array<GeoPoint & { name: string }> = [
  { name: '안암동', latitude: 37.5878, longitude: 127.0272 },
  { name: '종암동', latitude: 37.599, longitude: 127.0348 },
  { name: '보문동', latitude: 37.5842, longitude: 127.0178 },
  { name: '신설동', latitude: 37.5758, longitude: 127.0226 },
  { name: '회기동', latitude: 37.5908, longitude: 127.055 },
  { name: '청량리', latitude: 37.5792, longitude: 127.0468 },
  { name: '수유동', latitude: 37.6368, longitude: 127.0222 },
  { name: '미아동', latitude: 37.6148, longitude: 127.0272 },
  { name: '동선동', latitude: 37.5942, longitude: 127.0152 },
  { name: '월곡동', latitude: 37.6028, longitude: 127.0436 },
  { name: '제기동', latitude: 37.5788, longitude: 127.0372 },
]

export const SUBWAY_LINES: Array<{ name: string; color: string; path: GeoPoint[] }> = [
  {
    name: '6호선',
    color: '#B35100',
    path: [
      { latitude: 37.5858, longitude: 127.0194 },
      { latitude: 37.5863, longitude: 127.0292 },
      { latitude: 37.5907, longitude: 127.0365 },
      { latitude: 37.6019, longitude: 127.0416 },
    ],
  },
  {
    name: '4호선',
    color: '#00A5DE',
    path: [
      { latitude: 37.5884, longitude: 127.0062 },
      { latitude: 37.5926, longitude: 127.0165 },
      { latitude: 37.6034, longitude: 127.0251 },
      { latitude: 37.6133, longitude: 127.03 },
      { latitude: 37.6265, longitude: 127.026 },
      { latitude: 37.638, longitude: 127.0256 },
    ],
  },
  {
    name: '1호선',
    color: '#0032A0',
    path: [
      { latitude: 37.5753, longitude: 127.0248 },
      { latitude: 37.5778, longitude: 127.0348 },
      { latitude: 37.5802, longitude: 127.045 },
      { latitude: 37.5895, longitude: 127.0579 },
    ],
  },
  {
    name: '우이신설선',
    color: '#B7C452',
    path: [
      { latitude: 37.5753, longitude: 127.0248 },
      { latitude: 37.5858, longitude: 127.0194 },
      { latitude: 37.5926, longitude: 127.0165 },
    ],
  },
]

export const ROADS: GeoPoint[][] = [
  [
    { latitude: 37.572, longitude: 127.02 },
    { latitude: 37.58, longitude: 127.028 },
    { latitude: 37.5896, longitude: 127.0327 },
    { latitude: 37.602, longitude: 127.036 },
    { latitude: 37.62, longitude: 127.033 },
    { latitude: 37.646, longitude: 127.028 },
  ],
  [
    { latitude: 37.57, longitude: 127.01 },
    { latitude: 37.578, longitude: 127.022 },
    { latitude: 37.586, longitude: 127.04 },
    { latitude: 37.59, longitude: 127.058 },
    { latitude: 37.592, longitude: 127.07 },
  ],
  [
    { latitude: 37.582, longitude: 127.0 },
    { latitude: 37.5863, longitude: 127.0292 },
    { latitude: 37.588, longitude: 127.05 },
    { latitude: 37.586, longitude: 127.068 },
  ],
  [
    { latitude: 37.6, longitude: 127.004 },
    { latitude: 37.6034, longitude: 127.0251 },
    { latitude: 37.604, longitude: 127.046 },
    { latitude: 37.6, longitude: 127.068 },
  ],
  [
    { latitude: 37.614, longitude: 127.008 },
    { latitude: 37.6133, longitude: 127.03 },
    { latitude: 37.612, longitude: 127.055 },
  ],
  [
    { latitude: 37.57, longitude: 127.033 },
    { latitude: 37.5896, longitude: 127.0327 },
    { latitude: 37.62, longitude: 127.031 },
    { latitude: 37.646, longitude: 127.026 },
  ],
  [
    { latitude: 37.575, longitude: 127.045 },
    { latitude: 37.59, longitude: 127.044 },
    { latitude: 37.61, longitude: 127.042 },
  ],
  [
    { latitude: 37.5926, longitude: 127.008 },
    { latitude: 37.5926, longitude: 127.0165 },
    { latitude: 37.591, longitude: 127.0327 },
    { latitude: 37.5895, longitude: 127.0579 },
  ],
]

export const PARKS: Array<{ name: string; points: GeoPoint[] }> = [
  {
    name: '고려대학교',
    points: [
      { latitude: 37.5882, longitude: 127.0302 },
      { latitude: 37.5918, longitude: 127.0306 },
      { latitude: 37.5924, longitude: 127.0354 },
      { latitude: 37.589, longitude: 127.0362 },
      { latitude: 37.5874, longitude: 127.0334 },
    ],
  },
  {
    name: '개운산',
    points: [
      { latitude: 37.5956, longitude: 127.0278 },
      { latitude: 37.5994, longitude: 127.0284 },
      { latitude: 37.5998, longitude: 127.0328 },
      { latitude: 37.5964, longitude: 127.0336 },
    ],
  },
]
