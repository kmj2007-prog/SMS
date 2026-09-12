import type { VisibleInfraLink } from '../types'
import { project } from '../data/geo'
import { INFRA_LABELS } from '../data/infrastructure'
import {
  formatApproxDistance,
  formatWalkApprox,
} from '../utils/infrastructure'
import { InfraIcon } from './InfraIcon'

export function InfrastructureMarker({
  link,
  selected,
  hovered,
  scale,
  onHover,
  onLeave,
  onSelect,
}: {
  link: VisibleInfraLink
  selected: boolean
  hovered: boolean
  scale: number
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const { x, y } = project(link.match.facility)
  const sizeBoost = selected ? 1.22 : hovered ? 1.1 : 1
  const { facility, kind } = link.match

  return (
    <button
      className={`infraMarker ${selected ? 'isSelected' : ''} ${hovered ? 'isHovered' : ''}`}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${sizeBoost / scale})`,
        zIndex: selected ? 7 : hovered ? 5 : 3,
      }}
      aria-label={`${facility.title}, ${INFRA_LABELS[kind]}, ${formatApproxDistance(link.match.distance_m)}, ${formatWalkApprox(link.match.walk_min)}`}
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
      <span className="infraBadge">
        <InfraIcon kind={kind} size={12} />
      </span>
    </button>
  )
}
