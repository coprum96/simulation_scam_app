/**
 * Canonical risk types (Risk Engine).
 * @see project-docs/SESSION_CONTRACT.md
 */

export const RISK_LEVELS = ['low', 'medium', 'high'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

export const RISK_FLAG_IDS = [
  'ignored_warning',
  'warning_seen_then_cancelled',
  'fast_confirmation_in_risky_flow',
  'new_recipient_in_risky_scenario',
  'repeated_field_edits',
  'multiple_back_navigation_loops',
  'recovery_phrase_entered',
  'malicious_approval_signed',
  'signature_rejected_after_warning',
  'user_stopped_after_warning',
] as const

export type RiskFlagId = (typeof RISK_FLAG_IDS)[number]

export type RiskRuleHit = {
  ruleId: RiskFlagId
  delta: number
}

export type RiskAssessment = {
  riskScore: number
  riskLevel: RiskLevel
  riskFlags: RiskFlagId[]
  /** Сработавшие правила с дельтами (explainable) */
  ruleHits: RiskRuleHit[]
  /** Id правил для UI lookup в `ru.risk.rules` */
  reasons: RiskFlagId[]
}

export const EMPTY_RISK_ASSESSMENT: RiskAssessment = {
  riskScore: 0,
  riskLevel: 'low',
  riskFlags: [],
  ruleHits: [],
  reasons: [],
}

export type SessionRiskReport = {
  sessionId: string
  scenarioId: string
  simulatorType: 'banking' | 'wallet'
  catalogRiskLevel: RiskLevel
  expectedRiskFlags: string[]
  missedExpectedFlags: string[]
  unexpectedFlags: RiskFlagId[]
  assessment: RiskAssessment
  evaluatedAt: number
}
