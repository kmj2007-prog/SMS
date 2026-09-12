import type { InfrastructureKind } from '../types'
import { INFRASTRUCTURE_KINDS, INFRA_LABELS } from '../data/infrastructure'
import { InfraIcon } from './InfraIcon'

export function InfrastructureSelector({
  value,
  onChange,
}: {
  value: InfrastructureKind[]
  onChange: (next: InfrastructureKind[]) => void
}) {
  function toggle(kind: InfrastructureKind) {
    if (value.includes(kind)) {
      onChange(value.filter((item) => item !== kind))
      return
    }
    onChange([...value, kind])
  }

  return (
    <fieldset className="field">
      <legend>희망 인프라</legend>
      <div className="infraChipGrid">
        {INFRASTRUCTURE_KINDS.map((kind) => {
          const on = value.includes(kind)
          return (
            <button
              key={kind}
              type="button"
              className={`infraChip ${on ? 'isOn' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(kind)}
            >
              <InfraIcon kind={kind} />
              {INFRA_LABELS[kind]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
