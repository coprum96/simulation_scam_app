import { RISK_SCORE_THRESHOLDS } from '../../config/thresholds'
import type { SessionRecord, SessionSummary } from '../../types/contracts'
import type {
  RiskAssessment,
  RiskFlagId,
  RiskLevel,
  RiskRuleHit,
  SessionRiskReport,
} from '../../types/risk'
import type { Scenario } from '../../types/scenario'
import type { TelemetryEvent } from '../../types/telemetry'
import { getRuntimeRiskRules, type RiskRuleContext } from './riskRules'

export type RiskEvaluationInput = {
  events: TelemetryEvent[]
  summary: SessionSummary
  scenario: Scenario
  record: SessionRecord
}

function clampScore(score: number): number {
  return Math.min(RISK_SCORE_THRESHOLDS.highMax, Math.max(0, score))
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score <= RISK_SCORE_THRESHOLDS.lowMax) return 'low'
  if (score <= RISK_SCORE_THRESHOLDS.mediumMax) return 'medium'
  return 'high'
}

function compareExpectedFlags(
  triggered: RiskFlagId[],
  expected: string[],
): Pick<SessionRiskReport, 'missedExpectedFlags' | 'unexpectedFlags'> {
  const triggeredSet = new Set<string>(triggered)
  const expectedSet = new Set(expected)
  return {
    missedExpectedFlags: expected.filter((id) => !triggeredSet.has(id)),
    unexpectedFlags: triggered.filter((id) => !expectedSet.has(id)),
  }
}

/**
 * Rule-based risk assessment. Не изменяет SessionOutcome.
 */
export function evaluateRisk(input: RiskEvaluationInput): RiskAssessment {
  const ctx: RiskRuleContext = {
    events: input.events,
    summary: input.summary,
    scenario: input.scenario,
    record: input.record,
  }

  let rawScore = 0
  const ruleHits: RiskRuleHit[] = []

  for (const rule of getRuntimeRiskRules()) {
    if (!rule.condition(ctx)) continue
    rawScore += rule.delta
    ruleHits.push({ ruleId: rule.id, delta: rule.delta })
  }

  const riskScore = clampScore(rawScore)
  const riskFlags = ruleHits.map((h) => h.ruleId)

  return {
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
    riskFlags,
    ruleHits,
    reasons: [...riskFlags],
  }
}

export function buildSessionRiskReport(
  record: SessionRecord,
  scenario: Scenario,
  assessment: RiskAssessment,
  evaluatedAt = Date.now(),
): SessionRiskReport {
  const flagCompare = compareExpectedFlags(assessment.riskFlags, scenario.expectedRiskFlags)

  return {
    sessionId: record.sessionId,
    scenarioId: record.scenarioId,
    simulatorType: record.simulatorType,
    catalogRiskLevel: scenario.riskLevel,
    expectedRiskFlags: [...scenario.expectedRiskFlags],
    ...flagCompare,
    assessment,
    evaluatedAt,
  }
}
