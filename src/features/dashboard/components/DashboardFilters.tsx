import { mockProfiles } from '../../../data/profiles'
import { listRuntimeScenarios } from '../../../data/scenarios'
import {
  FILTER_ALL,
  RISK_FILTER_VALUES,
  SIMULATOR_FILTER_VALUES,
  riskFilterLabel,
  simulatorFilterLabel,
} from '../../../config'
import { ru } from '../../../content/ru'
import {
  DASHBOARD_OUTCOME_FILTER_VALUES,
  type DashboardFilterState,
} from '../dashboardFilters'
import { replayOutcomeLabel } from '../../session-replay/replayFormatters'

type DashboardFiltersProps = {
  value: DashboardFilterState
  onChange: (next: DashboardFilterState) => void
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

function outcomeFilterLabel(value: (typeof DASHBOARD_OUTCOME_FILTER_VALUES)[number]): string {
  if (value === FILTER_ALL) return ru.hub.filterAll
  return replayOutcomeLabel(value)
}

const selectClass =
  'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900'

export function DashboardFilters({ value, onChange }: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">{ru.dashboard.filtersTitle}</h2>

      <div>
        <p className="mb-2 text-xs text-slate-500">{ru.dashboard.filterSimulator}</p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="dash-scenario">
            {ru.dashboard.filterScenario}
          </label>
          <select
            id="dash-scenario"
            className={selectClass}
            value={value.scenarioId}
            onChange={(e) => onChange({ ...value, scenarioId: e.target.value })}
          >
            <option value={FILTER_ALL}>{ru.hub.filterAll}</option>
            {listRuntimeScenarios().map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="dash-profile">
            {ru.dashboard.filterProfile}
          </label>
          <select
            id="dash-profile"
            className={selectClass}
            value={value.profileId}
            onChange={(e) => onChange({ ...value, profileId: e.target.value })}
          >
            <option value={FILTER_ALL}>{ru.hub.filterAll}</option>
            {mockProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-slate-500">{ru.dashboard.filterRisk}</p>
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

      <div>
        <p className="mb-2 text-xs text-slate-500">{ru.dashboard.filterOutcome}</p>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_OUTCOME_FILTER_VALUES.map((option) => (
            <FilterChip
              key={option}
              active={value.outcome === option}
              label={outcomeFilterLabel(option)}
              onClick={() => onChange({ ...value, outcome: option })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
