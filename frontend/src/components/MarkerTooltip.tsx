import type { Listing } from '../types'
import { project } from '../data/geo'
import { formatMinutes, formatMonthlyRent } from '../utils/format'

export function MarkerTooltip({
  building,
  scale,
  badges,
}: {
  building: Listing
  scale: number
  badges?: string[]
}) {
  const { x, y } = project(building)
  return (
    <div
      className="markerTooltip"
      style={{
        left: x,
        top: y,
        transform: `translate(14px, calc(-100% - 10px)) scale(${1 / scale})`,
        transformOrigin: 'left bottom',
      }}
      role="tooltip"
    >
      <strong>{building.title}</strong>
      <span>
        {building.room_type} · {formatMonthlyRent(building.monthly_rent)}
      </span>
      <span>
        {building.destination.replace('학교', '')}까지 {formatMinutes(building.commute_min)}
      </span>
      {badges?.slice(0, 2).map((badge) => (
        <span key={badge} className="tooltipBadge">
          {badge}
        </span>
      ))}
    </div>
  )
}
