import type { Listing } from '../types'
import { useAppState } from '../context/AppStateContext'
import {
  formatDeposit,
  formatMinutes,
  formatMonthlyRent,
} from '../utils/format'
import { BuildingPhoto } from './BuildingPhoto'

export function SavedBuildingCard({ building }: { building: Listing }) {
  const { openSavedBuildingOnMap, toggleSaved } = useAppState()

  return (
    <article className="savedCard">
      <button className="savedCardMain" onClick={() => openSavedBuildingOnMap(building.id)}>
        <BuildingPhoto listing={building} className="savedCardPhoto" />
        <div>
          <h3>{building.title}</h3>
          <p>{building.address}</p>
          <p>
            {formatMonthlyRent(building.monthly_rent)} · {formatDeposit(building.deposit)}
          </p>
          <p>
            {building.room_type} · {building.nearest_station} · {building.destination}까지{' '}
            {formatMinutes(building.commute_min)}
          </p>
        </div>
      </button>
      <button
        className="heartBtn isOn"
        aria-label={`${building.title} 저장 해제`}
        onClick={() => toggleSaved(building.id)}
      >
        ♥
      </button>
    </article>
  )
}
