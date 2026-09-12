import { INFRA_LABELS } from '../data/infrastructure'
import type { InfrastructureKind } from '../types'
import { InfraIcon } from './InfraIcon'

export function InfrastructurePriorityItem({
  kind,
  index,
  total,
  dragging,
  onMove,
  onDragStart,
}: {
  kind: InfrastructureKind
  index: number
  total: number
  dragging: boolean
  onMove: (from: number, to: number) => void
  onDragStart: (index: number, event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  const label = INFRA_LABELS[kind]
  return (
    <li
      className={`priorityItem ${dragging ? 'isDragging' : ''}`}
      data-priority-index={index}
    >
      <button
        type="button"
        className="priorityHandle"
        aria-label={`${label} ${index + 1}순위. 드래그하거나 화살표로 순서 변경`}
        onPointerDown={(e) => onDragStart(index, e)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onMove(index, index - 1)
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            onMove(index, index + 1)
          }
        }}
      >
        ⋮⋮
      </button>
      <span className="priorityRank">{index + 1}순위</span>
      <span className="priorityName">
        <InfraIcon kind={kind} />
        {label}
      </span>
      <div className="priorityMove">
        <button
          type="button"
          aria-label={`${label} 한 단계 위로`}
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`${label} 한 단계 아래로`}
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
        >
          ↓
        </button>
      </div>
    </li>
  )
}
