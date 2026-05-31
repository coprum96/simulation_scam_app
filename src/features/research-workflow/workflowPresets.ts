import type { Session } from '../../types/contracts'
import { sessionRiskLevel } from '../dashboard/dashboardFilters'
import type { AnalyticsFilterState } from '../analytics/analyticsFilters'
import { DEFAULT_ANALYTICS_FILTERS } from '../analytics/analyticsFilters'
import type { WorkflowPresetId } from './types'

export type WorkflowPresetDefinition = {
  id: WorkflowPresetId
  filters: AnalyticsFilterState
  sessionPredicate?: (session: Session) => boolean
}

function sessionFlags(session: Session): string[] {
  const fromRecord = session.record.riskFlags ?? []
  const fromSummary = session.summary?.riskFlags ?? []
  const fromAssessment = session.riskReport?.assessment?.riskFlags ?? []
  const fromHits = session.riskReport?.assessment?.ruleHits?.map((h) => h.ruleId) ?? []
  return [...new Set([...fromRecord, ...fromSummary, ...fromAssessment, ...fromHits])]
}

export function hasSessionFlag(session: Session, flagId: string): boolean {
  return sessionFlags(session).includes(flagId)
}

export const WORKFLOW_PRESETS: WorkflowPresetDefinition[] = [
  {
    id: 'high_risk',
    filters: { ...DEFAULT_ANALYTICS_FILTERS, riskLevel: 'high' },
  },
  {
    id: 'abandoned_risky',
    filters: { ...DEFAULT_ANALYTICS_FILTERS, outcome: 'abandoned' },
    sessionPredicate: (session) => sessionRiskLevel(session) !== 'low',
  },
  {
    id: 'warning_dismiss',
    filters: { ...DEFAULT_ANALYTICS_FILTERS },
    sessionPredicate: (session) => hasSessionFlag(session, 'ignored_warning'),
  },
  {
    id: 'wallet_suspicious',
    filters: {
      ...DEFAULT_ANALYTICS_FILTERS,
      simulatorType: 'wallet',
      riskLevel: 'high',
    },
  },
]

export function getWorkflowPreset(id: WorkflowPresetId | null | undefined): WorkflowPresetDefinition | null {
  if (!id) return null
  return WORKFLOW_PRESETS.find((preset) => preset.id === id) ?? null
}

export function isWorkflowPresetId(value: string | null): value is WorkflowPresetId {
  return WORKFLOW_PRESETS.some((preset) => preset.id === value)
}
