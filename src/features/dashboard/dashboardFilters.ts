import { FILTER_ALL } from '../../config'
import { RISK_SCORE_THRESHOLDS } from '../../config/thresholds'
import type { Session, SessionOutcome } from '../../types/contracts'
import type { RiskLevel } from '../../types/scenario'
import type { RiskLevelFilter, SimulatorTypeFilter } from '../../config/simulator'

function riskLevelFromScore(score: number): RiskLevel {
  if (score <= RISK_SCORE_THRESHOLDS.lowMax) return 'low'
  if (score <= RISK_SCORE_THRESHOLDS.mediumMax) return 'medium'
  return 'high'
}

function normalizeRiskScore(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0
  return Math.min(RISK_SCORE_THRESHOLDS.highMax, Math.max(0, Math.round(value)))
}

export type DashboardOutcomeFilter = typeof FILTER_ALL | SessionOutcome

export type DashboardFilterState = {
  simulatorType: SimulatorTypeFilter
  scenarioId: typeof FILTER_ALL | string
  profileId: typeof FILTER_ALL | string
  riskLevel: RiskLevelFilter
  outcome: DashboardOutcomeFilter
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilterState = {
  simulatorType: FILTER_ALL,
  scenarioId: FILTER_ALL,
  profileId: FILTER_ALL,
  riskLevel: FILTER_ALL,
  outcome: FILTER_ALL,
}

export const DASHBOARD_OUTCOME_FILTER_VALUES: DashboardOutcomeFilter[] = [
  FILTER_ALL,
  'completed',
  'stopped',
  'abandoned',
]

export function sessionRiskScore(session: Session): number {
  const raw =
    session.record.riskScore ??
    session.summary?.riskScore ??
    session.riskReport?.assessment?.riskScore
  return normalizeRiskScore(raw)
}

export function sessionRiskLevel(session: Session): RiskLevel {
  const level =
    session.record.riskLevel ??
    session.summary?.riskLevel ??
    session.riskReport?.assessment?.riskLevel
  if (level) return level
  return riskLevelFromScore(sessionRiskScore(session))
}

export function isEndedSession(session: Session): boolean {
  return session.record.status === 'ended'
}

export function matchesDashboardFilters(
  session: Session,
  filters: DashboardFilterState,
): boolean {
  const { record, summary } = session
  if (record.status !== 'ended') return false

  if (
    filters.simulatorType !== FILTER_ALL &&
    record.simulatorType !== filters.simulatorType
  ) {
    return false
  }
  if (filters.scenarioId !== FILTER_ALL && record.scenarioId !== filters.scenarioId) {
    return false
  }
  if (filters.profileId !== FILTER_ALL && record.profileId !== filters.profileId) {
    return false
  }
  if (filters.outcome !== FILTER_ALL && record.outcome !== filters.outcome) {
    return false
  }
  if (filters.riskLevel !== FILTER_ALL) {
    const level = record.riskLevel ?? summary.riskLevel
    if (level !== filters.riskLevel) return false
  }
  return true
}

export function filterEndedSessions(
  sessions: Record<string, Session>,
  filters: DashboardFilterState,
): Session[] {
  return Object.values(sessions)
    .filter(isEndedSession)
    .filter((s) => matchesDashboardFilters(s, filters))
    .sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))
}

export function listEndedSessions(sessions: Record<string, Session>): Session[] {
  return Object.values(sessions)
    .filter(isEndedSession)
    .sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))
}
