import type { Listing } from '../types'
import { useAppState } from '../context/AppStateContext'
import { formatMinutes, formatMonthlyRent } from '../utils/format'

export function SavedBuildingItem({ building }: { building: Listing }) {
  const { selectBuilding, selectedBuildingId, toggleSaved } = useAppState()
  const selected = selectedBuildingId === building.id

  return (
    <li>
      <div className={`savedItem ${selected ? 'isSelected' : ''}`}>
        <button
          className="savedItemMain"
          onClick={() => selectBuilding(building.id)}
        >
          <strong>{building.title}</strong>
          <span>{formatMonthlyRent(building.monthly_rent)}</span>
          <span>
            {building.destination}까지 {formatMinutes(building.commute_min)}
          </span>
          <span>
            {building.nearest_station} 도보 {formatMinutes(building.walk_to_station_min)}
          </span>
        </button>
        <button
          className="heartBtn isOn"
          aria-label={`${building.title} 저장 해제`}
          onClick={() => toggleSaved(building.id)}
        >
          ♥
        </button>
      </div>
    </li>
  )
}
