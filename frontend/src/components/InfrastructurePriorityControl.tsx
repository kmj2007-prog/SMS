import { useEffect, useRef, useState } from 'react'
import { formatRankLine } from '../utils/infrastructure'
import type { InfrastructureKind } from '../types'
import { InfrastructurePriorityItem } from './InfrastructurePriorityItem'

function moveItem(list: InfrastructureKind[], from: number, to: number): InfrastructureKind[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function InfrastructurePriorityControl({
  value,
  onChange,
}: {
  value: InfrastructureKind[]
  onChange: (next: InfrastructureKind[]) => void
}) {
  const [dragging, setDragging] = useState<number | null>(null)
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  if (value.length === 0) return null

  function applyMove(from: number, to: number) {
    onChange(moveItem(value, from, to))
  }

  function onDragStart(index: number, event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    setDragging(index)
    let current = index

    const onMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const row = el?.closest('[data-priority-index]')
      if (!row) return
      const over = Number((row as HTMLElement).dataset.priorityIndex)
      if (Number.isNaN(over) || over === current) return
      const next = moveItem(valueRef.current, current, over)
      current = over
      valueRef.current = next
      onChange(next)
      setDragging(over)
    }

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
      setDragging(null)
    }

    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="priorityBlock">
      <p className="fieldLabel">희망순위</p>
      <p className="prioritySummary">{formatRankLine(value)}</p>
      {value.length > 1 && (
        <ol className="priorityList">
          {value.map((kind, index) => (
            <InfrastructurePriorityItem
              key={kind}
              kind={kind}
              index={index}
              total={value.length}
              dragging={dragging === index}
              onMove={applyMove}
              onDragStart={onDragStart}
            />
          ))}
        </ol>
      )}
    </div>
  )
}
