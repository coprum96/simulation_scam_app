import { FILTER_ALL } from '../../config'
import type { Session } from '../../types/contracts'
import {
  DEFAULT_DASHBOARD_FILTERS,
  matchesDashboardFilters,
  type DashboardFilterState,
} from '../dashboard/dashboardFilters'

export type AnalyticsFilterState = DashboardFilterState & {
  /** ISO date input `YYYY-MM-DD`; empty = no lower bound */
  dateFrom: string
  /** ISO date input `YYYY-MM-DD`; empty = no upper bound */
  dateTo: string
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilterState = {
  ...DEFAULT_DASHBOARD_FILTERS,
  dateFrom: '',
  dateTo: '',
}

function parseDateStartMs(date: string): number | null {
  const trimmed = date.trim()
  if (!trimmed) return null
  const ms = new Date(`${trimmed}T00:00:00`).getTime()
  return Number.isFinite(ms) ? ms : null
}

function parseDateEndMs(date: string): number | null {
  const trimmed = date.trim()
  if (!trimmed) return null
  const ms = new Date(`${trimmed}T23:59:59.999`).getTime()
  return Number.isFinite(ms) ? ms : null
}

function matchesDateRange(session: Session, dateFrom: string, dateTo: string): boolean {
  const hasDateFilter = Boolean(dateFrom.trim() || dateTo.trim())
  const endedAt = session.record.endedAt
  if (endedAt == null) return !hasDateFilter

  const fromMs = parseDateStartMs(dateFrom)
  if (fromMs != null && endedAt < fromMs) return false

  const toMs = parseDateEndMs(dateTo)
  if (toMs != null && endedAt > toMs) return false

  return true
}

export function filterAnalyticsSessions(
  sessions: Record<string, Session>,
  filters: AnalyticsFilterState,
): Session[] {
  return Object.values(sessions)
    .filter((s) => s.record.status === 'ended')
    .filter((s) => matchesDashboardFilters(s, filters))
    .filter((s) => matchesDateRange(s, filters.dateFrom, filters.dateTo))
    .sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))
}

export function listAllEndedSessions(sessions: Record<string, Session>): Session[] {
  return Object.values(sessions)
    .filter((s) => s.record.status === 'ended')
    .sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))
}

export { FILTER_ALL }
