import type { RouteSegment } from '../types'
import { formatMinutes } from '../utils/format'

const ICONS: Record<RouteSegment['kind'], string> = {
  origin: '⌂',
  walk: '도',
  subway: '지',
  bus: '버',
  transfer: '환',
  destination: '목',
}

export function TransitRouteStep({
  segment,
  isLast,
}: {
  segment: RouteSegment
  isLast: boolean
}) {
  return (
    <li className={`routeStep kind-${segment.kind} ${isLast ? 'isLast' : ''}`}>
      <div className="routeRail" aria-hidden="true">
        <span className="routeNode">{ICONS[segment.kind]}</span>
      </div>
      <div className="routeBody">
        <div className="routeHead">
          <strong>{segment.label}</strong>
          {segment.duration_min != null && (
            <em>{formatMinutes(segment.duration_min)}</em>
          )}
        </div>
        {(segment.line_name || segment.detail) && (
          <p>
            {segment.line_name && <span className="lineTag">{segment.line_name}</span>}
            {segment.detail}
          </p>
        )}
      </div>
    </li>
  )
}
