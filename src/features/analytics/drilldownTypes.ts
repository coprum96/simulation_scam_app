import type { SessionOutcome } from '../../types/contracts'
import type { RiskLevel } from '../../types/risk'
import type { SessionAnalyticsSummary } from './types'

export type AnalyticsScenarioChangeRow = {
  scenarioId: string
  recentSessions: number
  priorSessions: number
  delta: number
  deltaPercent: number
}

export type AnalyticsHighRiskConcentration = {
  overallHighRiskPercent: number
  topScenarios: Array<{
    scenarioId: string
    highRiskCount: number
    sessions: number
    concentrationPercent: number
  }>
  dominantFlag: string | null
  dominantFlagSessions: number
}

export type AnalyticsOutcomeNarrative = {
  riskLevel: RiskLevel
  sessions: number
  completedRate: number
  abandonedRate: number
  stoppedRate: number
  narrativeKey: 'highAbandon' | 'highComplete' | 'mediumMixed' | 'lowComplete' | 'lowAbandon' | 'generic'
}

export type AnalyticsInsights = {
  periodLabel: 'splitHalf' | 'insufficient'
  topScenarioChanges: AnalyticsScenarioChangeRow[]
  highRiskConcentration: AnalyticsHighRiskConcentration
  outcomeNarratives: AnalyticsOutcomeNarrative[]
}

export type AnalyticsDrilldownBase = {
  subjectLabel: string
  sessions: number
  summary: SessionAnalyticsSummary
}

export type AnalyticsScenarioDrilldown = AnalyticsDrilldownBase & {
  kind: 'scenario'
  scenarioId: string
}

export type AnalyticsFlagDrilldown = AnalyticsDrilldownBase & {
  kind: 'flag'
  flagId: string
  coOccurringFlags: Array<{ flagId: string; count: number; percent: number }>
}

export type AnalyticsRuleDrilldown = AnalyticsDrilldownBase & {
  kind: 'rule'
  ruleId: string
  effectiveness: {
    triggerCount: number
    sessionsTriggered: number
    sessionSharePercent: number
    totalScoreImpact: number
    avgScoreImpact: number
  }
  relatedFlags: Array<{ flagId: string; count: number }>
}

export type SessionRuleImpactRow = {
  ruleId: string
  delta: number
  runningScore: number
}

export type SessionExplainability = {
  sessionId: string
  scenarioId: string
  simulatorType: string
  outcome: SessionOutcome | null
  riskScore: number
  riskLevel: RiskLevel
  isHighRisk: boolean
  triggeredFlags: string[]
  ruleImpacts: SessionRuleImpactRow[]
  totalRuleDelta: number
  thresholdHighMin: number
  whyHighRiskKeys: Array<'scoreAboveThreshold' | 'rulesContributed' | 'flagsTriggered' | 'outcomeAbandoned'>
}

export type ComparativeDrilldownMode = 'scenario' | 'timeRange' | 'simulator'

export type ComparativeSideMetrics = {
  label: string
  sessions: number
  completedRate: number
  stoppedRate: number
  abandonedRate: number
  avgRiskScore: number
  highRiskPercent: number
  avgDurationMs: number
}

export type ComparativeDrilldownResult = {
  mode: ComparativeDrilldownMode
  sideA: ComparativeSideMetrics
  sideB: ComparativeSideMetrics
  deltas: {
    completedRate: number
    avgRiskScore: number
    highRiskPercent: number
    abandonedRate: number
  }
}
