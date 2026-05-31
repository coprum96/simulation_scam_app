import { FILTER_ALL, RISK_FILTER_VALUES, SIMULATOR_FILTER_VALUES } from '../../config'
import type { RiskLevelFilter } from '../../config/simulator'
import { DASHBOARD_OUTCOME_FILTER_VALUES } from '../dashboard/dashboardFilters'
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsFilterState,
} from './analyticsFilters'

const COMPARE_PARAM_KEYS = ['mode', 'a', 'b'] as const
const WORKFLOW_PRESET_PARAM = 'wfPreset'

const FILTER_KEYS = [
  'simulatorType',
  'scenarioId',
  'profileId',
  'riskLevel',
  'outcome',
  'dateFrom',
  'dateTo',
] as const

function readParam(params: URLSearchParams, key: string): string {
  return params.get(key) ?? ''
}

function sanitizeSimulatorType(value: string): AnalyticsFilterState['simulatorType'] {
  if (!value || value === FILTER_ALL) return FILTER_ALL
  return SIMULATOR_FILTER_VALUES.includes(value as AnalyticsFilterState['simulatorType'])
    ? (value as AnalyticsFilterState['simulatorType'])
    : FILTER_ALL
}

function sanitizeRiskLevel(value: string): RiskLevelFilter {
  if (!value || value === FILTER_ALL) return FILTER_ALL
  return RISK_FILTER_VALUES.includes(value as RiskLevelFilter)
    ? (value as RiskLevelFilter)
    : FILTER_ALL
}

function sanitizeOutcome(value: string): AnalyticsFilterState['outcome'] {
  if (!value || value === FILTER_ALL) return FILTER_ALL
  return DASHBOARD_OUTCOME_FILTER_VALUES.includes(value as AnalyticsFilterState['outcome'])
    ? (value as AnalyticsFilterState['outcome'])
    : FILTER_ALL
}

export function parseAnalyticsSearchParams(params: URLSearchParams): AnalyticsFilterState {
  return {
    simulatorType: sanitizeSimulatorType(readParam(params, 'simulatorType')),
    scenarioId: readParam(params, 'scenarioId') || FILTER_ALL,
    profileId: readParam(params, 'profileId') || FILTER_ALL,
    riskLevel: sanitizeRiskLevel(readParam(params, 'riskLevel')),
    outcome: sanitizeOutcome(readParam(params, 'outcome')),
    dateFrom: readParam(params, 'dateFrom'),
    dateTo: readParam(params, 'dateTo'),
  }
}

export function buildAnalyticsSearchParams(filters: AnalyticsFilterState): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of FILTER_KEYS) {
    const value = filters[key]
    if (key === 'simulatorType' || key === 'scenarioId' || key === 'profileId' || key === 'riskLevel' || key === 'outcome') {
      if (value && value !== FILTER_ALL) params.set(key, String(value))
    } else if (value) {
      params.set(key, String(value))
    }
  }
  return params
}

export function mergeAnalyticsSearchParams(
  base: URLSearchParams,
  extra: Record<string, string | undefined>,
): URLSearchParams {
  const merged = new URLSearchParams(base)
  for (const [key, value] of Object.entries(extra)) {
    if (value) merged.set(key, value)
    else merged.delete(key)
  }
  return merged
}

/** Preserve compare drilldown params (mode/a/b) when updating analytics filters. */
export function buildAnalyticsSearchParamsWithPreservedCompare(
  filters: AnalyticsFilterState,
  current: URLSearchParams,
): URLSearchParams {
  const params = buildAnalyticsSearchParams(filters)
  for (const key of COMPARE_PARAM_KEYS) {
    const value = current.get(key)
    if (value) params.set(key, value)
  }
  return params
}

export function parseCompareDrilldownMode(value: string | null): 'scenario' | 'timeRange' | 'simulator' {
  if (value === 'simulator' || value === 'timeRange') return value
  return 'scenario'
}

export function parseWorkflowPresetParam(params: URLSearchParams): string | null {
  return params.get(WORKFLOW_PRESET_PARAM)
}

export function buildAnalyticsSearchParamsWithWorkflowPreset(
  filters: AnalyticsFilterState,
  current: URLSearchParams,
  workflowPreset: string | null,
): URLSearchParams {
  const params = buildAnalyticsSearchParamsWithPreservedCompare(filters, current)
  if (workflowPreset) params.set(WORKFLOW_PRESET_PARAM, workflowPreset)
  else params.delete(WORKFLOW_PRESET_PARAM)
  return params
}

export { DEFAULT_ANALYTICS_FILTERS, WORKFLOW_PRESET_PARAM }
