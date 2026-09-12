import type { VisibleInfraLink } from '../types'
import { InfrastructureMarker } from './InfrastructureMarker'
import { InfrastructureTooltip } from './InfrastructureTooltip'

export function InfrastructureMapLayer({
  links,
  scale,
  selectedId,
  hoveredId,
  onHover,
  onLeave,
  onSelect,
}: {
  links: VisibleInfraLink[]
  scale: number
  selectedId: number | null
  hoveredId: number | null
  onHover: (id: number) => void
  onLeave: () => void
  onSelect: (id: number) => void
}) {
  const tooltipLink =
    links.find((link) => link.match.facility.id === (hoveredId ?? selectedId)) ??
    null
  const pinned = selectedId != null && tooltipLink?.match.facility.id === selectedId

  return (
    <>
      {links.map((link) => (
        <InfrastructureMarker
          key={`${link.fromBuilding.id}-${link.match.facility.id}`}
          link={link}
          selected={selectedId === link.match.facility.id}
          hovered={hoveredId === link.match.facility.id}
          scale={scale}
          onHover={() => onHover(link.match.facility.id)}
          onLeave={onLeave}
          onSelect={() => onSelect(link.match.facility.id)}
        />
      ))}
      {tooltipLink && (
        <InfrastructureTooltip
          link={tooltipLink}
          scale={scale}
          pinned={pinned}
        />
      )}
    </>
  )
}
