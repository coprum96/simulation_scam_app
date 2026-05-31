import type { Session, SessionOutcome } from '../../types/contracts'
import type { RiskLevel } from '../../types/risk'
import { sessionRiskLevel, sessionRiskScore } from '../dashboard/dashboardFilters'
import { computeComparativeAnalytics } from './sessionComparativeAnalytics'
import type {
  AnalyticsCountRow,
  AnalyticsHighRiskSessionRow,
  AnalyticsOutcomeByRiskLevel,
  AnalyticsOutcomeRates,
  AnalyticsRuleEffectivenessRow,
  AnalyticsScenarioPerformanceRow,
  AnalyticsScoreBucket,
  SessionAnalyticsSummary,
} from './types'

const SCORE_BUCKETS: Array<{ rangeLabel: string; min: number; max: number }> = [
  { rangeLabel: '0–19', min: 0, max: 19 },
  { rangeLabel: '20–39', min: 20, max: 39 },
  { rangeLabel: '40–59', min: 40, max: 59 },
  { rangeLabel: '60–79', min: 60, max: 79 },
  { rangeLabel: '80–100', min: 80, max: 100 },
]

function averageRounded(values: number[]): number {
  const finite = values.filter((n) => Number.isFinite(n))
  if (finite.length === 0) return 0
  return Math.round(finite.reduce((acc, n) => acc + n, 0) / finite.length)
}

function sessionDurationMs(session: Session): number {
  const fromSummary = session.summary?.totalDurationMs
  if (fromSummary != null && Number.isFinite(fromSummary)) return fromSummary
  const end = session.record.endedAt
  const start = session.record.startedAt
  if (
    end != null &&
    start != null &&
    Number.isFinite(end) &&
    Number.isFinite(start) &&
    end >= start
  ) {
    return end - start
  }
  return 0
}

function toPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

function countRows(counter: Map<string, number>, total: number, limit = 10): AnalyticsCountRow[] {
  return [...counter.entries()]
    .map(([key, count]) => ({ key, count, percent: toPercent(count, total) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function computeOutcomeRates(sessions: Session[]): AnalyticsOutcomeRates {
  const total = sessions.length
  const completed = sessions.filter((s) => s.record.outcome === 'completed').length
  const stopped = sessions.filter((s) => s.record.outcome === 'stopped').length
  const abandoned = sessions.filter((s) => s.record.outcome === 'abandoned').length
  return {
    completed,
    stopped,
    abandoned,
    completedRate: toPercent(completed, total),
    stoppedRate: toPercent(stopped, total),
    abandonedRate: toPercent(abandoned, total),
  }
}

function outcomeDistribution(sessions: Session[]): AnalyticsCountRow[] {
  const rates = computeOutcomeRates(sessions)
  const total = sessions.length
  const rows: Array<{ key: SessionOutcome; count: number }> = [
    { key: 'completed', count: rates.completed },
    { key: 'stopped', count: rates.stopped },
    { key: 'abandoned', count: rates.abandoned },
  ]
  return rows.map(({ key, count }) => ({
    key,
    count,
    percent: toPercent(count, total),
  }))
}

function riskLevelDistribution(sessions: Session[]): AnalyticsCountRow[] {
  const counter = new Map<RiskLevel, number>()
  for (const level of ['low', 'medium', 'high'] as RiskLevel[]) counter.set(level, 0)
  for (const session of sessions) {
    const level = sessionRiskLevel(session)
    counter.set(level, (counter.get(level) ?? 0) + 1)
  }
  const total = sessions.length
  return (['low', 'medium', 'high'] as RiskLevel[]).map((key) => ({
    key,
    count: counter.get(key) ?? 0,
    percent: toPercent(counter.get(key) ?? 0, total),
  }))
}

function sessionsByScenario(sessions: Session[]): AnalyticsCountRow[] {
  const counter = new Map<string, number>()
  for (const session of sessions) {
    const id = session.record.scenarioId
    counter.set(id, (counter.get(id) ?? 0) + 1)
  }
  return countRows(counter, sessions.length, 12)
}

function topRiskFlags(sessions: Session[]): AnalyticsCountRow[] {
  const counter = new Map<string, number>()
  for (const session of sessions) {
    const flags = session.record.riskFlags ?? session.summary?.riskFlags ?? []
    for (const flag of flags) {
      if (!flag) continue
      counter.set(flag, (counter.get(flag) ?? 0) + 1)
    }
  }
  const totalOccurrences = [...counter.values()].reduce((acc, count) => acc + count, 0)
  return [...counter.entries()]
    .map(([key, count]) => ({ key, count, percent: toPercent(count, totalOccurrences) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function ruleEffectiveness(sessions: Session[]): AnalyticsRuleEffectivenessRow[] {
  const triggerCount = new Map<string, number>()
  const totalDelta = new Map<string, number>()
  const sessionsWithRule = new Map<string, number>()

  for (const session of sessions) {
    const hits = session.riskReport?.assessment?.ruleHits ?? []
    const seenInSession = new Set<string>()
    for (const hit of hits) {
      triggerCount.set(hit.ruleId, (triggerCount.get(hit.ruleId) ?? 0) + 1)
      totalDelta.set(hit.ruleId, (totalDelta.get(hit.ruleId) ?? 0) + hit.delta)
      seenInSession.add(hit.ruleId)
    }
    for (const ruleId of seenInSession) {
      sessionsWithRule.set(ruleId, (sessionsWithRule.get(ruleId) ?? 0) + 1)
    }
  }

  const total = sessions.length
  return [...triggerCount.entries()]
    .map(([ruleId, count]) => {
      const sessionsTriggered = sessionsWithRule.get(ruleId) ?? 0
      const impact = totalDelta.get(ruleId) ?? 0
      return {
        ruleId,
        triggerCount: count,
        sessionsTriggered,
        sessionSharePercent: toPercent(sessionsTriggered, total),
        totalScoreImpact: impact,
        avgScoreImpact: count > 0 ? Math.round((impact / count) * 10) / 10 : 0,
      }
    })
    .sort((a, b) => b.triggerCount - a.triggerCount)
}

function riskScoreDistribution(sessions: Session[]): AnalyticsScoreBucket[] {
  const total = sessions.length
  const buckets = SCORE_BUCKETS.map((b) => ({ ...b, count: 0, percent: 0 }))
  for (const session of sessions) {
    const score = sessionRiskScore(session)
    const bucket = buckets.find((b) => score >= b.min && score <= b.max)
    if (bucket) bucket.count += 1
  }
  return buckets.map((b) => ({ ...b, percent: toPercent(b.count, total) }))
}

function highRiskSessions(sessions: Session[], limit = 15): AnalyticsHighRiskSessionRow[] {
  return sessions
    .filter((s) => sessionRiskLevel(s) === 'high')
    .sort((a, b) => sessionRiskScore(b) - sessionRiskScore(a))
    .slice(0, limit)
    .map((s) => ({
      sessionId: s.record.sessionId,
      scenarioId: s.record.scenarioId,
      simulatorType: s.record.simulatorType,
      outcome: s.record.outcome,
      riskScore: sessionRiskScore(s),
      riskLevel: sessionRiskLevel(s),
      topFlags: (s.record.riskFlags ?? s.summary.riskFlags ?? []).slice(0, 5),
      endedAt: s.record.endedAt ?? 0,
    }))
}

function scenarioComparison(sessions: Session[]): AnalyticsScenarioPerformanceRow[] {
  const buckets = new Map<string, Session[]>()
  for (const session of sessions) {
    const id = session.record.scenarioId
    const group = buckets.get(id) ?? []
    group.push(session)
    buckets.set(id, group)
  }

  return [...buckets.entries()]
    .map(([scenarioId, group]) => {
      const rates = computeOutcomeRates(group)
      let highRiskCount = 0
      let lowRiskCount = 0
      let mediumRiskCount = 0
      for (const session of group) {
        const level = sessionRiskLevel(session)
        if (level === 'high') highRiskCount += 1
        else if (level === 'low') lowRiskCount += 1
        else mediumRiskCount += 1
      }
      return {
        scenarioId,
        sessions: group.length,
        completedRate: rates.completedRate,
        stoppedRate: rates.stoppedRate,
        abandonedRate: rates.abandonedRate,
        avgDurationMs: averageRounded(group.map(sessionDurationMs)),
        avgRiskScore: averageRounded(group.map(sessionRiskScore)),
        highRiskCount,
        lowRiskCount,
        mediumRiskCount,
        highRiskCountPercent: toPercent(highRiskCount, group.length),
      }
    })
    .sort((a, b) => b.sessions - a.sessions)
}

function outcomeByRiskLevel(sessions: Session[]): AnalyticsOutcomeByRiskLevel[] {
  const levels: RiskLevel[] = ['low', 'medium', 'high']
  return levels.map((riskLevel) => {
    const group = sessions.filter((s) => sessionRiskLevel(s) === riskLevel)
    return {
      riskLevel,
      sessions: group.length,
      rates: computeOutcomeRates(group),
    }
  })
}

const EMPTY_RATES: AnalyticsOutcomeRates = {
  completed: 0,
  stopped: 0,
  abandoned: 0,
  completedRate: 0,
  stoppedRate: 0,
  abandonedRate: 0,
}

export function computeSessionAnalytics(
  filteredSessions: Session[],
  totalEndedCount: number,
): SessionAnalyticsSummary {
  const sessions = filteredSessions

  if (sessions.length === 0) {
    return {
      meta: {
        totalSessions: totalEndedCount,
        filteredSessions: 0,
        computedAt: new Date().toISOString(),
      },
      sessionsByScenario: [],
      outcomeRates: EMPTY_RATES,
      avgDurationMs: 0,
      outcomeDistribution: [],
      riskLevelDistribution: [],
      topRiskFlags: [],
      ruleEffectiveness: [],
      riskScoreDistribution: SCORE_BUCKETS.map((b) => ({ ...b, count: 0, percent: 0 })),
      highRiskSessions: [],
      scenarioComparison: [],
      outcomeByRiskLevel: (['low', 'medium', 'high'] as RiskLevel[]).map((riskLevel) => ({
        riskLevel,
        sessions: 0,
        rates: EMPTY_RATES,
      })),
      comparative: computeComparativeAnalytics([]),
    }
  }

  return {
    meta: {
      totalSessions: totalEndedCount,
      filteredSessions: sessions.length,
      computedAt: new Date().toISOString(),
    },
    sessionsByScenario: sessionsByScenario(sessions),
    outcomeRates: computeOutcomeRates(sessions),
    avgDurationMs: averageRounded(sessions.map(sessionDurationMs)),
    outcomeDistribution: outcomeDistribution(sessions),
    riskLevelDistribution: riskLevelDistribution(sessions),
    topRiskFlags: topRiskFlags(sessions),
    ruleEffectiveness: ruleEffectiveness(sessions),
    riskScoreDistribution: riskScoreDistribution(sessions),
    highRiskSessions: highRiskSessions(sessions),
    scenarioComparison: scenarioComparison(sessions),
    outcomeByRiskLevel: outcomeByRiskLevel(sessions),
    comparative: computeComparativeAnalytics(sessions),
  }
}
