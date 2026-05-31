import { ru } from '../../../content/ru'
import type { AnalyticsFilterState } from '../../analytics/analyticsFilters'
import { DEFAULT_ANALYTICS_FILTERS } from '../../analytics/analyticsFilters'
import type { WorkflowPresetId } from '../types'
import { WORKFLOW_PRESETS } from '../workflowPresets'

type ResearchQuickFiltersProps = {
  activePresetId: WorkflowPresetId | null
  onSelectPreset: (presetId: WorkflowPresetId | null, filters: AnalyticsFilterState) => void
}

const presetLabels: Record<WorkflowPresetId, string> = {
  high_risk: ru.researcher.workflow.presets.highRisk,
  abandoned_risky: ru.researcher.workflow.presets.abandonedRisky,
  warning_dismiss: ru.researcher.workflow.presets.warningDismiss,
  wallet_suspicious: ru.researcher.workflow.presets.walletSuspicious,
}

export function ResearchQuickFilters({ activePresetId, onSelectPreset }: ResearchQuickFiltersProps) {
  return (
    <div className="space-y-2 border-t border-slate-200 pt-4">
      <div>
        <p className="text-xs font-medium text-slate-700">{ru.researcher.workflow.quickFiltersTitle}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{ru.researcher.workflow.quickFiltersHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_PRESETS.map((preset) => {
          const active = activePresetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                if (active) onSelectPreset(null, { ...DEFAULT_ANALYTICS_FILTERS })
                else onSelectPreset(preset.id, preset.filters)
              }}
              className={`inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-teal-700 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {presetLabels[preset.id]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
