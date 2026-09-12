import type { TransportMode } from '../types'
import { DESTINATION_OPTIONS } from '../data/mapPlaces'
import { useAppState } from '../context/AppStateContext'
import { formatManwon } from '../utils/format'

const COMMUTE_OPTIONS = [10, 20, 30, 40, 50, 60]
const RENT_OPTIONS = [40, 45, 50, 55, 60, 70, 80]
const TRANSPORTS: { id: TransportMode; label: string }[] = [
  { id: 'subway', label: '지하철' },
  { id: 'bus', label: '버스' },
  { id: 'walk', label: '도보' },
]

export function SearchPanel() {
  const {
    searchDraft,
    setSearchDraft,
    runSearch,
    hasSearched,
    searchResults,
  } = useAppState()

  const canSearch =
    searchDraft.transport_modes.length > 0 && searchDraft.room_types.length > 0

  function toggleMode(mode: TransportMode) {
    setSearchDraft((prev) => {
      const has = prev.transport_modes.includes(mode)
      return {
        ...prev,
        transport_modes: has
          ? prev.transport_modes.filter((item) => item !== mode)
          : [...prev.transport_modes, mode],
      }
    })
  }

  function toggleRoom(room: '원룸' | '오피스텔') {
    setSearchDraft((prev) => {
      const has = prev.room_types.includes(room)
      return {
        ...prev,
        room_types: has
          ? prev.room_types.filter((item) => item !== room)
          : [...prev.room_types, room],
      }
    })
  }

  return (
    <section className="panel searchPanel" aria-label="검색 조건">
      <h2 className="panelTitle">어디에 살면 좋을까요?</h2>
      <p className="panelLead">목적지와 통근 조건에 맞는 건물을 찾습니다.</p>

      <label className="field">
        <span>목적지</span>
        <input
          list="destination-options"
          value={searchDraft.destination}
          onChange={(e) =>
            setSearchDraft((prev) => ({ ...prev, destination: e.target.value }))
          }
        />
        <datalist id="destination-options">
          {DESTINATION_OPTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <label className="field">
        <span>최대 통근시간</span>
        <select
          value={searchDraft.max_commute_min}
          onChange={(e) =>
            setSearchDraft((prev) => ({
              ...prev,
              max_commute_min: Number(e.target.value),
            }))
          }
        >
          {COMMUTE_OPTIONS.map((min) => (
            <option key={min} value={min}>
              {min}분 이내
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field">
        <legend>교통수단</legend>
        <div className="chipRow">
          {TRANSPORTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${searchDraft.transport_modes.includes(item.id) ? 'isOn' : ''}`}
              aria-pressed={searchDraft.transport_modes.includes(item.id)}
              onClick={() => toggleMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>월세 상한</span>
        <select
          value={searchDraft.max_monthly_rent}
          onChange={(e) =>
            setSearchDraft((prev) => ({
              ...prev,
              max_monthly_rent: Number(e.target.value),
            }))
          }
        >
          {RENT_OPTIONS.map((rent) => (
            <option key={rent} value={rent}>
              {formatManwon(rent)} 이하
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field">
        <legend>방 형태</legend>
        <div className="chipRow">
          {(['원룸', '오피스텔'] as const).map((room) => (
            <button
              key={room}
              type="button"
              className={`chip ${searchDraft.room_types.includes(room) ? 'isOn' : ''}`}
              aria-pressed={searchDraft.room_types.includes(room)}
              onClick={() => toggleRoom(room)}
            >
              {room}
            </button>
          ))}
        </div>
      </fieldset>

      {hasSearched && (
        <p className={`resultHint ${searchResults.length === 0 ? 'isEmpty' : ''}`}>
          {searchResults.length === 0
            ? '조건에 맞는 건물이 없습니다. 조건을 변경해 보세요.'
            : `조건에 맞는 건물 ${searchResults.length}개`}
        </p>
      )}

      <button
        className="primaryBtn"
        disabled={!canSearch}
        onClick={() => runSearch()}
      >
        건물 찾아보기
      </button>
    </section>
  )
}
