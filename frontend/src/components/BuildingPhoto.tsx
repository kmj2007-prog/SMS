import type { Listing } from '../types'

const TONES = ['#8d6b5c', '#6b7380', '#6f7d62', '#6a7c8d', '#8a7360', '#7a6a7d']

export function BuildingPhoto({
  listing,
  className,
}: {
  listing: Listing
  className?: string
}) {
  const tone = TONES[listing.id % TONES.length]
  const windows = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className={className ?? 'buildingPhoto'} aria-hidden="true">
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="180" fill="#d8d2c8" />
        <rect x="0" y="118" width="320" height="62" fill="#c9c2b6" />
        <rect x="78" y="22" width="164" height="140" fill={tone} />
        <rect x="78" y="18" width="164" height="10" fill="#3c3c3c" />
        {windows.map((i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          return (
            <rect
              key={i}
              x={92 + col * 36}
              y={36 + row * 34}
              width="18"
              height="20"
              fill={i % 3 === 0 ? '#f3e7c8' : '#e8eef4'}
              opacity="0.92"
            />
          )
        })}
        <rect x="148" y="128" width="24" height="34" fill="#2f2f2f" />
        <text x="160" y="172" textAnchor="middle" fontSize="11" fill="#5c564e">
          {listing.neighborhood}
        </text>
      </svg>
    </div>
  )
}
