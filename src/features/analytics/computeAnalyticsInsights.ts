import type { Session } from '../../types/contracts'
import type { RiskLevel } from '../../types/risk'
import { RISK_SCORE_THRESHOLDS } from '../../config/thresholds'
import { sessionRiskLevel } from '../dashboard/dashboardFilters'
import { computeSessionAnalytics } from './computeSessionAnalytics'
import type {
  AnalyticsHighRiskConcentration,
  AnalyticsInsights,
  AnalyticsOutcomeNarrative,
  AnalyticsScenarioChangeRow,
} from './drilldownTypes'

function toPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

function splitSessionsByTime(sessions: Session[]): { recent: Session[]; prior: Session[] } {
  if (sessions.length < 2) {
    return { recent: sessions, prior: [] }
  }
  const sorted = [...sessions].sort(
    (a, b) => (a.record.endedAt ?? 0) - (b.record.endedAt ?? 0),
  )
  const mid = Math.floor(sorted.length / 2)
  return { prior: sorted.slice(0, mid), recent: sorted.slice(mid) }
}

function scenarioCounts(sessions: Session[]): Map<string, number> {
  const counter = new Map<string, number>()
  for (const session of sessions) {
    const id = session.record.scenarioId
    counter.set(id, (counter.get(id) ?? 0) + 1)
  }
  return counter
}

function computeScenarioChanges(recent: Session[], prior: Session[]): AnalyticsScenarioChangeRow[] {
  const recentMap = scenarioCounts(recent)
  const priorMap = scenarioCounts(prior)
  const ids = new Set([...recentMap.keys(), ...priorMap.keys()])

  return [...ids]
    .map((scenarioId) => {
      const recentSessions = recentMap.get(scenarioId) ?? 0
      const priorSessions = priorMap.get(scenarioId) ?? 0
      const delta = recentSessions - priorSessions
      const deltaPercent =
        priorSessions > 0
          ? Math.round((delta / priorSessions) * 100)
          : recentSessions > 0
            ? 100
            : 0
      return { scenarioId, recentSessions, priorSessions, delta, deltaPercent }
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5)
}

function computeHighRiskConcentration(
  sessions: Session[],
  summary: ReturnType<typeof computeSessionAnalytics>,
): AnalyticsHighRiskConcentration {
  const highRiskCount =
    summary.riskLevelDistribution.find((row) => row.key === 'high')?.count ?? 0
  const overallHighRiskPercent = toPercent(highRiskCount, sessions.length)

  const topScenarios = summary.scenarioComparison
    .filter((row) => row.highRiskCount > 0)
    .map((row) => ({
      scenarioId: row.scenarioId,
      highRiskCount: row.highRiskCount,
      sessions: row.sessions,
      concentrationPercent: toPercent(row.highRiskCount, highRiskCount || 1),
    }))
    .sort((a, b) => b.highRiskCount - a.highRiskCount)
    .slice(0, 5)

  const topFlag = summary.topRiskFlags[0]
  const highRiskSessions = sessions.filter((s) => sessionRiskLevel(s) === 'high')
  let dominantFlag: string | null = null
  let dominantFlagSessions = 0
  if (topFlag) {
    dominantFlag = topFlag.key
    dominantFlagSessions = highRiskSessions.filter((s) => {
      const flags = s.record.riskFlags ?? s.summary?.riskFlags ?? []
      return flags.includes(topFlag.key)
    }).length
  }

  return {
    overallHighRiskPercent,
    topScenarios,
    dominantFlag,
    dominantFlagSessions,
  }
}

function narrativeKeyForLevel(
  riskLevel: RiskLevel,
  completedRate: number,
  abandonedRate: number,
): AnalyticsOutcomeNarrative['narrativeKey'] {
  if (riskLevel === 'high') {
    return abandonedRate >= completedRate ? 'highAbandon' : 'highComplete'
  }
  if (riskLevel === 'low') {
    return completedRate >= abandonedRate ? 'lowComplete' : 'lowAbandon'
  }
  return 'mediumMixed'
}

function computeOutcomeNarratives(
  summary: ReturnType<typeof computeSessionAnalytics>,
): AnalyticsOutcomeNarrative[] {
  return summary.outcomeByRiskLevel
    .filter((row) => row.sessions > 0)
    .map((row) => ({
      riskLevel: row.riskLevel,
      sessions: row.sessions,
      completedRate: row.rates.completedRate,
      abandonedRate: row.rates.abandonedRate,
      stoppedRate: row.rates.stoppedRate,
      narrativeKey: narrativeKeyForLevel(
        row.riskLevel,
        row.rates.completedRate,
        row.rates.abandonedRate,
      ),
    }))
}

export function computeAnalyticsInsights(
  sessions: Session[],
  summary: ReturnType<typeof computeSessionAnalytics>,
): AnalyticsInsights {
  const { recent, prior } = splitSessionsByTime(sessions)
  const periodLabel = prior.length > 0 ? 'splitHalf' : 'insufficient'

  return {
    periodLabel,
    topScenarioChanges: prior.length > 0 ? computeScenarioChanges(recent, prior) : [],
    highRiskConcentration: computeHighRiskConcentration(sessions, summary),
    outcomeNarratives: computeOutcomeNarratives(summary),
  }
}

export { RISK_SCORE_THRESHOLDS }
