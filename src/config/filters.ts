import type { RiskLevel, SimulatorType } from '../types/scenario'
import type { RiskLevelFilter, SimulatorTypeFilter } from './simulator'

export const FILTER_ALL = 'all' as const

export const SIMULATOR_FILTER_VALUES: SimulatorTypeFilter[] = [
  FILTER_ALL,
  'banking',
  'wallet',
]

export const RISK_FILTER_VALUES: RiskLevelFilter[] = [
  FILTER_ALL,
  'low',
  'medium',
  'high',
]

export type ScenarioFilterState = {
  simulatorType: SimulatorTypeFilter
  riskLevel: RiskLevelFilter
}

export const DEFAULT_SCENARIO_FILTERS: ScenarioFilterState = {
  simulatorType: FILTER_ALL,
  riskLevel: FILTER_ALL,
}

export function matchesScenarioFilters(
  scenario: { simulatorType: SimulatorType; riskLevel: RiskLevel },
  filters: ScenarioFilterState,
): boolean {
  if (filters.simulatorType !== FILTER_ALL && scenario.simulatorType !== filters.simulatorType) {
    return false
  }
  if (filters.riskLevel !== FILTER_ALL && scenario.riskLevel !== filters.riskLevel) {
    return false
  }
  return true
}
