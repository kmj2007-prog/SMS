import type { InfrastructureKind } from '../types'

export const INFRASTRUCTURE_KINDS: InfrastructureKind[] = [
  'gym',
  'cinema',
  'park',
  'library',
]

export const INFRA_LABELS: Record<InfrastructureKind, string> = {
  gym: '헬스장',
  cinema: '영화관',
  park: '공원',
  library: '도서관',
}

export const INFRA_SEARCH_RADIUS_M = 1500
