import type { SessionOutcome } from '../../types/contracts'
import type { RiskLevel } from '../../types/risk'
import type { ComparativeAnalytics } from './sessionComparativeAnalytics'

export type AnalyticsCountRow = {
  key: string
  count: number
  percent: number
}

export type AnalyticsOutcomeRates = {
  completed: number
  stopped: number
  abandoned: number
  completedRate: number
  stoppedRate: number
  abandonedRate: number
}

export type AnalyticsScoreBucket = {
  rangeLabel: string
  min: number
  max: number
  count: number
  percent: number
}

export type AnalyticsRuleEffectivenessRow = {
  ruleId: string
  triggerCount: number
  sessionsTriggered: number
  sessionSharePercent: number
  totalScoreImpact: number
  avgScoreImpact: number
}

export type AnalyticsScenarioPerformanceRow = {
  scenarioId: string
  sessions: number
  completedRate: number
  stoppedRate: number
  abandonedRate: number
  avgDurationMs: number
  avgRiskScore: number
  highRiskCount: number
  lowRiskCount: number
  mediumRiskCount: number
  highRiskCountPercent: number
}

export type AnalyticsHighRiskSessionRow = {
  sessionId: string
  scenarioId: string
  simulatorType: string
  outcome: SessionOutcome | null
  riskScore: number
  riskLevel: RiskLevel
  topFlags: string[]
  endedAt: number
}

export type AnalyticsOutcomeByRiskLevel = {
  riskLevel: RiskLevel
  sessions: number
  rates: AnalyticsOutcomeRates
}

export type SessionAnalyticsSummary = {
  meta: {
    totalSessions: number
    filteredSessions: number
    computedAt: string
  }
  sessionsByScenario: AnalyticsCountRow[]
  outcomeRates: AnalyticsOutcomeRates
  avgDurationMs: number
  outcomeDistribution: AnalyticsCountRow[]
  riskLevelDistribution: AnalyticsCountRow[]
  topRiskFlags: AnalyticsCountRow[]
  ruleEffectiveness: AnalyticsRuleEffectivenessRow[]
  riskScoreDistribution: AnalyticsScoreBucket[]
  highRiskSessions: AnalyticsHighRiskSessionRow[]
  scenarioComparison: AnalyticsScenarioPerformanceRow[]
  outcomeByRiskLevel: AnalyticsOutcomeByRiskLevel[]
  comparative: ComparativeAnalytics
}
