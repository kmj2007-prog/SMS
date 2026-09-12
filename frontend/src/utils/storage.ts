import type {
  InfrastructureKind,
  Listing,
  RecentSearch,
  SearchConditions,
  UserProfile,
} from '../types'

export const STORAGE_KEYS = {
  saved: 'salmyeon-sala:saved-ids',
  savedListings: 'salmyeon-sala:saved-listings',
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

function isListing(value: unknown): value is Listing {
  if (!value || typeof value !== 'object') return false
  const item = value as Listing
  return Number.isInteger(item.id) && typeof item.title === 'string'
}

export function loadSavedListings(): Listing[] {
  const items = readJson<unknown>(STORAGE_KEYS.savedListings, [])
  if (!Array.isArray(items)) return []
  return items.filter(isListing)
}

export function saveSavedListings(listings: Listing[]): void {
  localStorage.setItem(STORAGE_KEYS.savedListings, JSON.stringify(listings))
}

export function loadRecentSearches(fallback: RecentSearch[]): RecentSearch[] {
  const items = readJson<RecentSearch[]>(STORAGE_KEYS.recent, fallback)
  if (!Array.isArray(items)) return fallback
  return items.map((item) => ({
    ...item,
    infrastructure_priority: Array.isArray(item.infrastructure_priority)
      ? item.infrastructure_priority
      : [],
  }))
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
    infrastructure_priority: [...conditions.infrastructure_priority],
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
    infrastructure_priority: [],
    searched_at: '2026-09-10T18:12:00',
  },
]

export function uniquePriority(value: unknown): InfrastructureKind[] {
  if (!Array.isArray(value)) return []
  const allowed: InfrastructureKind[] = ['gym', 'park', 'cinema', 'library']
  return value.filter((item): item is InfrastructureKind =>
    allowed.includes(item as InfrastructureKind),
  )
}
