import type { InfrastructureKind } from '../types'

export function InfraIcon({
  kind,
  size = 14,
}: {
  kind: InfrastructureKind
  size?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    'aria-hidden': true as const,
  }

  if (kind === 'gym') {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M1 6.5h1.5v3H1v-3Zm2 0h1v3H3v-3Zm2-.8h6v4.6H5V5.7Zm7 .8h1v3h-1v-3Zm2 0H16v3h-1.5v-3Z"
        />
      </svg>
    )
  }
  if (kind === 'park') {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M8 1.2 12.6 8H10l2.2 4.2H3.8L6 8H3.4L8 1.2ZM7.2 12.4h1.6V14.6H7.2z"
        />
      </svg>
    )
  }
  if (kind === 'cinema') {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M2 4h12v8H2V4Zm1.4 1.3v1.1h1.2V5.3H3.4Zm0 2.2v1.1h1.2V7.5H3.4Zm0 2.2v1.1h1.2v-1.1H3.4ZM11.4 5.3v1.1h1.2V5.3h-1.2Zm0 2.2v1.1h1.2V7.5h-1.2Zm0 2.2v1.1h1.2v-1.1h-1.2Z"
        />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path
        fill="currentColor"
        d="M3 2.5h8.2c.9 0 1.6.7 1.6 1.6V13H5.2c-.9 0-1.6-.7-1.6-1.6V3.2c0-.4-.3-.7-.6-.7H3V2.5Zm1.6 1.2v7.4c0 .3.2.5.5.5h6.1V4.2H4.6Z"
      />
    </svg>
  )
}
