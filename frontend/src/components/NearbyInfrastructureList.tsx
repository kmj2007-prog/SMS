import type { InfrastructureMatch } from '../types'
import { INFRA_LABELS } from '../data/infrastructure'
import {
  formatApproxDistance,
  formatWalkApprox,
} from '../utils/infrastructure'
import { InfraIcon } from './InfraIcon'

export function NearbyInfrastructureList({
  matches,
  score,
  onFocus,
}: {
  matches: InfrastructureMatch[]
  score: number
  onFocus: (facilityId: number) => void
}) {
  if (matches.length === 0) {
    return (
      <section className="nearbyInfra" aria-label="주변 희망 인프라">
        <h3>주변 희망 인프라</h3>
        <p className="emptyCopy">검색 조건에서 희망 인프라를 선택해 보세요.</p>
      </section>
    )
  }

  return (
    <section className="nearbyInfra" aria-label="주변 희망 인프라">
      <div className="nearbyHead">
        <h3>주변 희망 인프라</h3>
        {score > 0 && <span className="scorePill">추천도 {score}</span>}
      </div>
      <ul className="nearbyList">
        {matches.map((match) => (
          <li key={match.kind}>
            <div className="nearbyItem">
              <p className="nearbyRank">
                <InfraIcon kind={match.kind} />
                {match.rank}순위 · {INFRA_LABELS[match.kind]}
              </p>
              <strong>{match.facility.title}</strong>
              <p>
                {formatApproxDistance(match.distance_m)} · {formatWalkApprox(match.walk_min)}
              </p>
              <button
                type="button"
                className="ghostBtn sm"
                onClick={() => onFocus(match.facility.id)}
              >
                지도에서 보기
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
