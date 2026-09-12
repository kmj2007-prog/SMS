import type { RecentSearch, SearchConditions, UserProfile } from '../types'

export const STORAGE_KEYS = {
  saved: 'salmyeon-sala:saved-ids',
  recent: 'salmyeon-sala:recent-searches',
  user: 'salmyeon-sala:user',
} as const

export const MOCK_USER: UserProfile = {
  name: '김하은',
  email: 'haeun@example.com',
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadSavedIds(fallback: number[]): number[] {
  const ids = readJson<number[]>(STORAGE_KEYS.saved, fallback)
  return Array.isArray(ids) ? ids.filter((id) => Number.isInteger(id)) : fallback
}

export function saveSavedIds(ids: number[]): void {
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(ids))
}

export function loadRecentSearches(fallback: RecentSearch[]): RecentSearch[] {
  const items = readJson<RecentSearch[]>(STORAGE_KEYS.recent, fallback)
  return Array.isArray(items) ? items : fallback
}

export function saveRecentSearches(items: RecentSearch[]): void {
  localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(items))
}

export function loadUser(fallback: UserProfile | null): UserProfile | null {
  return readJson<UserProfile | null>(STORAGE_KEYS.user, fallback)
}

export function saveUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user)
    return
  }
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function conditionsToRecent(conditions: SearchConditions): RecentSearch {
  return {
    id: `${Date.now()}`,
    destination: conditions.destination,
    max_commute_min: conditions.max_commute_min,
    max_monthly_rent: conditions.max_monthly_rent,
    transport_modes: [...conditions.transport_modes],
    room_types: [...conditions.room_types],
    searched_at: new Date().toISOString(),
  }
}

export const INITIAL_RECENT: RecentSearch[] = [
  {
    id: 'seed-1',
    destination: '고려대학교',
    max_commute_min: 30,
    max_monthly_rent: 60,
    transport_modes: ['subway', 'bus'],
    room_types: ['원룸'],
    searched_at: '2026-09-10T18:12:00',
  },
  {
    id: 'seed-2',
    destination: '고려대학교',
    max_commute_min: 20,
    max_monthly_rent: 50,
    transport_modes: ['subway'],
    room_types: ['원룸'],
    searched_at: '2026-09-08T11:05:00',
  },
]
