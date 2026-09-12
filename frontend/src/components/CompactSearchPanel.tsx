import { useAppState } from '../context/AppStateContext'
import { formatManwon, formatRoomTypes, formatTransport } from '../utils/format'

export function CompactSearchPanel() {
  const { searchConditions, runSearch, setSavedPanelOpen } = useAppState()
  const transports = searchConditions.transport_modes.map(formatTransport).join(', ')

  return (
    <section className="panel compactSearchPanel" aria-label="검색 조건 요약">
      <p className="compactLine">
        {searchConditions.destination} · {searchConditions.max_commute_min}분
      </p>
      <p className="compactLine muted">
        월세 {formatManwon(searchConditions.max_monthly_rent)} ·{' '}
        {formatRoomTypes(searchConditions.room_types)}
      </p>
      <p className="compactLine muted">{transports}</p>
      <div className="compactActions">
        <button
          className="ghostBtn"
          onClick={() => setSavedPanelOpen(false)}
        >
          조건 수정
        </button>
        <button className="primaryBtn sm" onClick={() => runSearch(searchConditions)}>
          검색
        </button>
      </div>
    </section>
  )
}
