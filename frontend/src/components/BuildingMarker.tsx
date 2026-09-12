import type { Listing } from '../types'
import { project } from '../data/geo'
import { formatMinutes, formatMonthlyRent } from '../utils/format'

export function BuildingMarker({
  building,
  selected,
  hovered,
  saved,
  rank,
  scale,
  onHover,
  onLeave,
  onSelect,
}: {
  building: Listing
  selected: boolean
  hovered: boolean
  saved: boolean
  rank?: number
  scale: number
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const { x, y } = project(building)
  const sizeBoost = selected ? 1.28 : hovered ? 1.12 : 1

  return (
    <button
      className={`buildingMarker ${selected ? 'isSelected' : ''} ${hovered ? 'isHovered' : ''}`}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${sizeBoost / scale})`,
        zIndex: selected ? 8 : hovered ? 6 : 4,
      }}
      aria-label={`${building.title}, ${building.room_type}, ${formatMonthlyRent(building.monthly_rent)}, ${building.destination}까지 ${formatMinutes(building.commute_min)}`}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {selected && <span className="markerPulse" aria-hidden="true" />}
      <span className="markerPin" aria-hidden="true" />
      {rank != null && rank <= 3 && (
        <span className="markerRank" aria-hidden="true">
          {rank}
        </span>
      )}
      {saved && (
        <span className="markerSaved" aria-hidden="true">
          ♥
        </span>
      )}
    </button>
  )
}
