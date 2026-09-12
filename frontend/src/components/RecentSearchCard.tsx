import type { RecentSearch } from '../types'
import { useAppState } from '../context/AppStateContext'
import { formatInfraSummary } from '../utils/infrastructure'
import {
  formatDateTime,
  formatManwon,
  formatRoomTypes,
  formatTransport,
} from '../utils/format'

export function RecentSearchCard({ search }: { search: RecentSearch }) {
  const { rerunSearch } = useAppState()
  const infraSummary = formatInfraSummary(search.infrastructure_priority ?? [])

  return (
    <article className="recentCard">
      <div>
        <h3>{search.destination}</h3>
        <p>
          {search.max_commute_min}분 · 월세 {formatManwon(search.max_monthly_rent)} ·{' '}
          {formatRoomTypes(search.room_types)}
        </p>
        <p>
          {search.transport_modes.map(formatTransport).join(', ')} ·{' '}
          {formatDateTime(search.searched_at)}
        </p>
        {infraSummary && <p>{infraSummary}</p>}
      </div>
      <button className="primaryBtn sm" onClick={() => rerunSearch(search)}>
        다시 검색
      </button>
    </article>
  )
}
