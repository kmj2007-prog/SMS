import type { InfrastructureKind, InfrastructureMatch } from '../types'
import { INFRA_LABELS, INFRA_SEARCH_RADIUS_M } from '../data/infrastructure'
import { formatDistanceMeters, formatWalkApprox } from '../utils/infrastructure'
import { InfraIcon } from './InfraIcon'

function radiusLabel(meters: number) {
  const km = meters / 1000
  return Number.isInteger(km) ? `${km}km` : `${km.toFixed(1)}km`
}

export function NearbyInfrastructureList({
  kinds,
  nearbyByKind,
  loading,
  error,
}: {
  kinds: InfrastructureKind[]
  nearbyByKind: Array<{ kind: InfrastructureKind; match: InfrastructureMatch | null }>
  loading: boolean
  error: string | null
}) {
  return (
    <section className="nearbyInfra" aria-label="주변 희망 시설">
      <h3>주변 희망 시설</h3>
      {kinds.length === 0 ? (
        <p className="emptyCopy">검색 조건에서 희망 인프라를 선택해 보세요.</p>
      ) : loading ? (
        <p className="emptyCopy">주변 시설을 찾는 중...</p>
      ) : error ? (
        <p className="emptyCopy">{error}</p>
      ) : (
        <ul className="nearbyList">
          {kinds.map((kind) => {
            const match = nearbyByKind.find((item) => item.kind === kind)?.match ?? null
            return (
              <li key={kind}>
                <p className="nearbyRank">
                  <InfraIcon kind={kind} />
                  {INFRA_LABELS[kind]}
                </p>
                {match ? (
                  <>
                    <strong>{match.facility.title}</strong>
                    <p>
                      {formatDistanceMeters(match.distance_m)} · {formatWalkApprox(match.walk_min)}
                    </p>
                  </>
                ) : (
                  <p>주변 {radiusLabel(INFRA_SEARCH_RADIUS_M)} 내 시설 없음</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
