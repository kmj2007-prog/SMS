import type { Listing } from '../types'
import { useAppState } from '../context/AppStateContext'
import {
  formatArea,
  formatBuildingAge,
  formatDeposit,
  formatMaintenance,
  formatMinutes,
  formatMonthlyRent,
} from '../utils/format'
import { matchesForBuilding } from '../utils/infrastructure'
import { BuildingPhoto } from './BuildingPhoto'
import { NearbyInfrastructureList } from './NearbyInfrastructureList'
import { TransitRouteTimeline } from './TransitRouteTimeline'

export function BuildingDetailPanel({ building }: { building: Listing }) {
  const {
    isSaved,
    toggleSaved,
    selectBuilding,
    cancelHoverClose,
    delayClearHover,
    searchConditions,
    scoreFor,
    focusInfrastructure,
  } = useAppState()
  const saved = isSaved(building.id)
  const scored = scoreFor(building.id)
  const priority = searchConditions.infrastructure_priority
  const matches =
    scored?.nearest ??
    (priority.length > 0 ? matchesForBuilding(building, priority) : [])

  return (
    <aside
      className="panel detailPanel"
      aria-label={`${building.title} 상세`}
      onMouseEnter={cancelHoverClose}
      onMouseLeave={delayClearHover}
    >
      <div className="detailTop">
        <button
          className="iconBtn"
          aria-label="상세 닫기"
          onClick={() => selectBuilding(null)}
        >
          ×
        </button>
      </div>
      <BuildingPhoto listing={building} className="detailPhoto" />
      <div className="detailHead">
        <div>
          <h2>{building.title}</h2>
          <p>{building.address}</p>
        </div>
        <button
          className={`saveCta ${saved ? 'isOn' : ''}`}
          aria-pressed={saved}
          aria-label={saved ? `${building.title} 저장 해제` : `${building.title} 저장`}
          onClick={() => toggleSaved(building.id)}
        >
          {saved ? '♥ 저장됨' : '♡ 저장'}
        </button>
      </div>

      <dl className="detailFacts">
        <div>
          <dt>보증금</dt>
          <dd>{formatDeposit(building.deposit).replace('보증금 ', '')}</dd>
        </div>
        <div>
          <dt>월세</dt>
          <dd>{formatMonthlyRent(building.monthly_rent).replace('월세 ', '')}</dd>
        </div>
        <div>
          <dt>관리비</dt>
          <dd>{formatMaintenance(building.maintenance_fee).replace('관리비 ', '')}</dd>
        </div>
        <div>
          <dt>방 형태</dt>
          <dd>{building.room_type}</dd>
        </div>
        <div>
          <dt>전용면적</dt>
          <dd>{formatArea(building.area)}</dd>
        </div>
        <div>
          <dt>건물 유형</dt>
          <dd>{building.building_type}</dd>
        </div>
        <div>
          <dt>가까운 역</dt>
          <dd>
            {building.nearest_station} · 도보 {formatMinutes(building.walk_to_station_min)}
          </dd>
        </div>
        <div>
          <dt>준공</dt>
          <dd>{formatBuildingAge(building.built_year)}</dd>
        </div>
        <div>
          <dt>목적지까지</dt>
          <dd>{formatMinutes(building.commute_min)}</dd>
        </div>
      </dl>

      <NearbyInfrastructureList
        matches={matches}
        score={scored?.score ?? 0}
        onFocus={focusInfrastructure}
      />

      <TransitRouteTimeline building={building} />
    </aside>
  )
}
