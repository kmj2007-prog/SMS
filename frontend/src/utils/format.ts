import type { InfrastructureKind, RoomType, TransportMode } from '../types'
import { INFRA_LABELS } from '../data/infrastructure'

export function formatManwon(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${value.toLocaleString('ko-KR')}만원`
}

export function formatMonthlyRent(value: number): string {
  return `월세 ${formatManwon(value)}`
}

export function formatDeposit(value: number): string {
  return `보증금 ${value.toLocaleString('ko-KR')}만원`
}

export function formatMaintenance(value: number | null | undefined): string {
  if (value == null) return '관리비 정보 없음'
  return `관리비 ${formatManwon(value)}`
}

export function formatMinutes(min: number | null | undefined): string {
  if (min == null) return '-'
  return `${min}분`
}

export function formatFare(won: number): string {
  if (won <= 0) return '교통비 0원'
  return `${won.toLocaleString('ko-KR')}원`
}

export function formatArea(area: number): string {
  return `${area}㎡`
}

export function formatTransport(mode: TransportMode): string {
  if (mode === 'subway') return '지하철'
  if (mode === 'bus') return '버스'
  return '도보'
}

export function formatRoomTypes(types: RoomType[]): string {
  return types.join(', ')
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatBuildingAge(
  builtYear: number | null | undefined,
  now = 2026,
): string {
  if (builtYear == null) return '준공 정보 없음'

  const age = now - builtYear

  if (age <= 0) return `${builtYear}년 준공`

  return `${builtYear}년 준공 · ${age}년차`
}

export function formatInfraKind(kind: InfrastructureKind): string {
  return INFRA_LABELS[kind]
}
