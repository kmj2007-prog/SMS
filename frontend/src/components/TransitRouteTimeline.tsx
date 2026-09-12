import type { Listing } from '../types'
import { formatFare, formatMinutes } from '../utils/format'
import { TransitRouteStep } from './TransitRouteStep'

export function TransitRouteTimeline({ building }: { building: Listing }) {
  return (
    <section className="routeBlock" aria-label="목적지까지 이동 경로">
      <h3>목적지까지 이동</h3>
      <div className="routeSummary">
        <span>총 {formatMinutes(building.commute_min)}</span>
        <span>환승 {building.transfer_count}회</span>
        <span>예상 {formatFare(building.fare)}</span>
      </div>
      <ol className="routeList">
        {building.route_segments.map((segment, index) => (
          <TransitRouteStep
            key={`${segment.kind}-${segment.label}-${index}`}
            segment={segment}
            isLast={index === building.route_segments.length - 1}
          />
        ))}
      </ol>
    </section>
  )
}
