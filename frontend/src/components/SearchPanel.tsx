import type { CSSProperties } from 'react'
import type { TransportMode } from '../types'
import { DESTINATION_OPTIONS } from '../data/mapPlaces'
import { useAppState } from '../context/AppStateContext'
import { formatManwon } from '../utils/format'
import { InfrastructurePriorityControl } from './InfrastructurePriorityControl'
import { InfrastructureSelector } from './InfrastructureSelector'

const COMMUTE_OPTIONS = [10, 20, 30, 40, 50, 60]
const RENT_MIN = 40
const RENT_MAX = 100
const RENT_STEP = 5
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
    searchConditions,
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
        <span className="sliderHead">
          <span>월세 상한</span>
          <strong>{formatManwon(searchDraft.max_monthly_rent)} 이하</strong>
        </span>
        <input
          className="rentSlider"
          type="range"
          min={RENT_MIN}
          max={RENT_MAX}
          step={RENT_STEP}
          value={searchDraft.max_monthly_rent}
          aria-valuemin={RENT_MIN}
          aria-valuemax={RENT_MAX}
          aria-valuenow={searchDraft.max_monthly_rent}
          aria-valuetext={`${formatManwon(searchDraft.max_monthly_rent)} 이하`}
          style={
            {
              '--fill': `${((searchDraft.max_monthly_rent - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100}%`,
            } as CSSProperties
          }
          onChange={(e) =>
            setSearchDraft((prev) => ({
              ...prev,
              max_monthly_rent: Number(e.target.value),
            }))
          }
        />
        <span className="sliderEnds">
          <span>{formatManwon(RENT_MIN)}</span>
          <span>{formatManwon(RENT_MAX)}</span>
        </span>
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

      <InfrastructureSelector
        value={searchDraft.infrastructure_priority}
        onChange={(infrastructure_priority) =>
          setSearchDraft((prev) => ({ ...prev, infrastructure_priority }))
        }
      />
      <InfrastructurePriorityControl
        value={searchDraft.infrastructure_priority}
        onChange={(infrastructure_priority) =>
          setSearchDraft((prev) => ({ ...prev, infrastructure_priority }))
        }
      />

      {hasSearched && (
        <p className={`resultHint ${searchResults.length === 0 ? 'isEmpty' : ''}`}>
          {searchResults.length === 0
            ? '조건에 맞는 건물이 없습니다. 조건을 변경해 보세요.'
            : searchConditions.infrastructure_priority.length > 0
              ? `조건에 맞는 건물 ${searchResults.length}개 · 추천순`
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
