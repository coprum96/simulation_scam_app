import { ROUTES } from '../../config'
import type { AnalyticsFilterState } from './analyticsFilters'
import { buildAnalyticsSearchParams } from './analyticsSearchParams'

export type ComparativeDrilldownQuery = {
  mode?: 'scenario' | 'timeRange' | 'simulator'
  a?: string
  b?: string
}

function withFilters(path: string, filters?: AnalyticsFilterState): string {
  if (!filters) return path
  const qs = buildAnalyticsSearchParams(filters).toString()
  return qs ? `${path}?${qs}` : path
}

export function analyticsDashboardPath(filters?: AnalyticsFilterState): string {
  return withFilters(ROUTES.dashboard, filters)
}

export function analyticsScenarioDrilldownPath(
  scenarioId: string,
  filters?: AnalyticsFilterState,
): string {
  return withFilters(`${ROUTES.dashboard}/scenario/${encodeURIComponent(scenarioId)}`, filters)
}

export function analyticsFlagDrilldownPath(flagId: string, filters?: AnalyticsFilterState): string {
  return withFilters(`${ROUTES.dashboard}/flag/${encodeURIComponent(flagId)}`, filters)
}

export function analyticsRuleDrilldownPath(ruleId: string, filters?: AnalyticsFilterState): string {
  return withFilters(`${ROUTES.dashboard}/rule/${encodeURIComponent(ruleId)}`, filters)
}

export function analyticsSessionExplainPath(
  sessionId: string,
  filters?: AnalyticsFilterState,
): string {
  return withFilters(`${ROUTES.dashboard}/session/${encodeURIComponent(sessionId)}`, filters)
}

export function analyticsComparePath(
  query: ComparativeDrilldownQuery,
  filters?: AnalyticsFilterState,
): string {
  const params = filters ? buildAnalyticsSearchParams(filters) : new URLSearchParams()
  if (query.mode) params.set('mode', query.mode)
  if (query.a) params.set('a', query.a)
  if (query.b) params.set('b', query.b)
  const qs = params.toString()
  return qs ? `${ROUTES.dashboard}/compare?${qs}` : `${ROUTES.dashboard}/compare`
}
