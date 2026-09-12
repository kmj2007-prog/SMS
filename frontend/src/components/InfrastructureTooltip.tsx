import type { VisibleInfraLink } from '../types'
import { project } from '../data/geo'
import { INFRA_LABELS } from '../data/infrastructure'
import {
  formatApproxDistance,
  formatWalkApprox,
} from '../utils/infrastructure'

export function InfrastructureTooltip({
  link,
  scale,
  pinned,
}: {
  link: VisibleInfraLink
  scale: number
  pinned?: boolean
}) {
  const { x, y } = project(link.match.facility)
  const { facility, kind, distance_m, walk_min } = link.match

  return (
    <div
      className={`markerTooltip infraTooltip ${pinned ? 'isPinned' : ''}`}
      style={{
        left: x,
        top: y,
        transform: `translate(16px, -50%) scale(${1 / scale})`,
        transformOrigin: 'left center',
      }}
      role="tooltip"
    >
      <strong>{facility.title}</strong>
      <span>{INFRA_LABELS[kind]}</span>
      <span>
        건물에서 {formatApproxDistance(distance_m)}
      </span>
      <span>{formatWalkApprox(walk_min)}</span>
      {pinned && <span>{facility.hours}</span>}
    </div>
  )
}
