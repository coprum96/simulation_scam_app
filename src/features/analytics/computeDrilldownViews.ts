import type { Session } from '../../types/contracts'
import { RISK_SCORE_THRESHOLDS } from '../../config/thresholds'
import { sessionRiskLevel, sessionRiskScore } from '../dashboard/dashboardFilters'
import { computeSessionAnalytics } from './computeSessionAnalytics'
import type {
  AnalyticsFlagDrilldown,
  AnalyticsRuleDrilldown,
  AnalyticsScenarioDrilldown,
  SessionExplainability,
} from './drilldownTypes'

function sessionFlags(session: Session): string[] {
  const fromRecord = session.record.riskFlags ?? session.summary?.riskFlags ?? []
  const fromAssessment = session.riskReport?.assessment?.riskFlags ?? []
  return [...new Set([...fromRecord, ...fromAssessment].filter(Boolean))]
}

function sessionHasFlag(session: Session, flagId: string): boolean {
  return sessionFlags(session).includes(flagId)
}

function sessionHasRule(session: Session, ruleId: string): boolean {
  const hits = session.riskReport?.assessment?.ruleHits ?? []
  return hits.some((hit) => hit.ruleId === ruleId)
}

export function filterSessionsByScenario(sessions: Session[], scenarioId: string): Session[] {
  return sessions.filter((s) => s.record.scenarioId === scenarioId)
}

export function filterSessionsByFlag(sessions: Session[], flagId: string): Session[] {
  return sessions.filter((s) => sessionHasFlag(s, flagId))
}

export function filterSessionsByRule(sessions: Session[], ruleId: string): Session[] {
  return sessions.filter((s) => sessionHasRule(s, ruleId))
}

export function computeScenarioDrilldown(
  allFiltered: Session[],
  scenarioId: string,
  totalEndedCount: number,
): AnalyticsScenarioDrilldown {
  const scoped = filterSessionsByScenario(allFiltered, scenarioId)
  const summary = computeSessionAnalytics(scoped, totalEndedCount)
  return {
    kind: 'scenario',
    scenarioId,
    subjectLabel: scenarioId,
    sessions: scoped.length,
    summary,
  }
}

export function computeFlagDrilldown(
  allFiltered: Session[],
  flagId: string,
  totalEndedCount: number,
): AnalyticsFlagDrilldown {
  const scoped = filterSessionsByFlag(allFiltered, flagId)
  const summary = computeSessionAnalytics(scoped, totalEndedCount)
  const counter = new Map<string, number>()
  for (const session of scoped) {
    for (const flag of sessionFlags(session)) {
      if (flag === flagId) continue
      counter.set(flag, (counter.get(flag) ?? 0) + 1)
    }
  }
  const coTotal = [...counter.values()].reduce((acc, n) => acc + n, 0)
  const coOccurringFlags = [...counter.entries()]
    .map(([id, count]) => ({ flagId: id, count, percent: coTotal > 0 ? Math.round((count / coTotal) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return {
    kind: 'flag',
    flagId,
    subjectLabel: flagId,
    sessions: scoped.length,
    summary,
    coOccurringFlags,
  }
}

export function computeRuleDrilldown(
  allFiltered: Session[],
  ruleId: string,
  totalEndedCount: number,
): AnalyticsRuleDrilldown {
  const scoped = filterSessionsByRule(allFiltered, ruleId)
  const summary = computeSessionAnalytics(scoped, totalEndedCount)
  const row = summary.ruleEffectiveness.find((r) => r.ruleId === ruleId)
  const flagCounter = new Map<string, number>()
  for (const session of scoped) {
    for (const flag of sessionFlags(session)) {
      flagCounter.set(flag, (flagCounter.get(flag) ?? 0) + 1)
    }
  }
  const relatedFlags = [...flagCounter.entries()]
    .map(([flagId, count]) => ({ flagId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return {
    kind: 'rule',
    ruleId,
    subjectLabel: ruleId,
    sessions: scoped.length,
    summary,
    effectiveness: row ?? {
      ruleId,
      triggerCount: 0,
      sessionsTriggered: 0,
      sessionSharePercent: 0,
      totalScoreImpact: 0,
      avgScoreImpact: 0,
    },
    relatedFlags,
  }
}

export function computeSessionExplainability(session: Session | undefined): SessionExplainability | null {
  if (!session || session.record.status !== 'ended') return null

  const riskScore = sessionRiskScore(session)
  const riskLevel = sessionRiskLevel(session)
  const triggeredFlags = sessionFlags(session)

  const ruleHits = session.riskReport?.assessment?.ruleHits ?? []
  let running = 0
  const ruleImpacts = ruleHits.map((hit) => {
    running += hit.delta
    return {
      ruleId: hit.ruleId,
      delta: hit.delta,
      runningScore: running,
    }
  })
  const totalRuleDelta = ruleImpacts.reduce((acc, row) => acc + row.delta, 0)

  const whyHighRiskKeys: SessionExplainability['whyHighRiskKeys'] = []
  const isHighRisk = riskLevel === 'high'
  const thresholdHighMin = RISK_SCORE_THRESHOLDS.mediumMax + 1

  if (isHighRisk) {
    if (riskScore >= thresholdHighMin) whyHighRiskKeys.push('scoreAboveThreshold')
    if (ruleImpacts.length > 0) whyHighRiskKeys.push('rulesContributed')
    if (triggeredFlags.length > 0) whyHighRiskKeys.push('flagsTriggered')
    if (session.record.outcome === 'abandoned') whyHighRiskKeys.push('outcomeAbandoned')
  }

  return {
    sessionId: session.record.sessionId,
    scenarioId: session.record.scenarioId,
    simulatorType: session.record.simulatorType,
    outcome: session.record.outcome,
    riskScore,
    riskLevel,
    isHighRisk,
    triggeredFlags,
    ruleImpacts,
    totalRuleDelta,
    thresholdHighMin,
    whyHighRiskKeys,
  }
}
