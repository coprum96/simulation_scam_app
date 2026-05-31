import {
  RISK_FILTER_VALUES,
  SIMULATOR_FILTER_VALUES,
  riskFilterLabel,
  simulatorFilterLabel,
  type ScenarioFilterState,
} from '../../config'
import { ru } from '../../content/ru'

type ScenarioFiltersProps = {
  value: ScenarioFilterState
  onChange: (next: ScenarioFilterState) => void
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-teal-700 text-white'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

export function ScenarioFilters({ value, onChange }: ScenarioFiltersProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">{ru.hub.filtersTitle}</h2>

      <div>
        <p className="mb-2 text-xs text-slate-500">{ru.hub.filterSimulator}</p>
        <div className="flex flex-wrap gap-2">
          {SIMULATOR_FILTER_VALUES.map((option) => (
            <FilterChip
              key={option}
              active={value.simulatorType === option}
              label={simulatorFilterLabel(option)}
              onClick={() => onChange({ ...value, simulatorType: option })}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-slate-500">{ru.hub.filterRisk}</p>
        <div className="flex flex-wrap gap-2">
          {RISK_FILTER_VALUES.map((option) => (
            <FilterChip
              key={option}
              active={value.riskLevel === option}
              label={riskFilterLabel(option)}
              onClick={() => onChange({ ...value, riskLevel: option })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export type { ScenarioFilterState }
