import type { RiskFlagId, RiskLevel } from './risk'
import type { SimulatorType } from './scenario'
import type { TelemetryEventType } from './telemetry'

import type { AuthoringDocumentLifecycle, AuthoringReviewState } from './authoringLifecycle'

export const RISK_RULE_CONFIG_SCHEMA_VERSION = 1

export type RiskRuleConfigStatus = AuthoringReviewState

/** Declarative condition kinds aligned with MVP runtime evaluators. */
export const RISK_RULE_CONDITION_TYPES = [
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

export type RiskRuleConditionType = (typeof RISK_RULE_CONDITION_TYPES)[number]

export type RiskRuleConditionParams = {
  /** ignored_warning, user_stopped_after_warning */
  dismissTypes?: string[]
  /** fast_confirmation_in_risky_flow */
  maxConfirmationDelayMs?: number
  /** new_recipient_in_risky_scenario */
  screenId?: string
  requiresElevatedCatalogRisk?: boolean
  /** repeated_field_edits */
  minFieldEditCount?: number
  /** multiple_back_navigation_loops */
  minBackNavigationCount?: number
  /** recovery_phrase_entered */
  eventType?: TelemetryEventType
  /** malicious_approval_signed */
  scenarioId?: string
  /** signature_rejected_after_warning */
  afterEventType?: TelemetryEventType
}

export type RiskRuleCondition = {
  type: RiskRuleConditionType
  params?: RiskRuleConditionParams
}

export type RiskRuleApplicabilityScope = 'all' | SimulatorType

export type RiskRuleCatalogRiskScope = 'any' | 'elevated' | RiskLevel

export type RiskRuleApplicability = {
  simulatorType: RiskRuleApplicabilityScope
  catalogRiskScope: RiskRuleCatalogRiskScope
  /** If set, rule applies only to these scenario ids */
  scenarioIds?: string[]
}

export type RiskRuleLevelHint = 'auto' | RiskLevel

/** Versioned risk rule definition (authoring data, not UI code). */
export type RiskRuleConfigDocument = {
  schemaVersion: typeof RISK_RULE_CONFIG_SCHEMA_VERSION
  ruleId: string
  version: number
  status: RiskRuleConfigStatus
  enabled: boolean
  title: string
  description: string
  applicability: RiskRuleApplicability
  condition: RiskRuleCondition
  scoreDelta: number
  emittedRiskFlags: RiskFlagId[]
  levelHint: RiskRuleLevelHint
  createdAt: string
  updatedAt: string
  lifecycle?: AuthoringDocumentLifecycle
}

export type RiskRuleConfigExportBundle = {
  exportSchema: 'risk_rule_config_bundle'
  exportSchemaVersion: 1
  exportedAt: string
  documents: RiskRuleConfigDocument[]
}

export type RiskRuleConfigValidationSeverity = 'blocking' | 'warning'

export type RiskRuleConfigValidationMessageKey =
  | 'ruleIdRequired'
  | 'ruleIdFormat'
  | 'ruleIdDuplicate'
  | 'ruleIdBuiltinOverrideHint'
  | 'titleRequired'
  | 'descriptionRequired'
  | 'scoreDeltaInvalid'
  | 'scoreDeltaExtreme'
  | 'emittedFlagsRequired'
  | 'emittedFlagUnknown'
  | 'emittedFlagMissingRuleId'
  | 'conditionTypeRequired'
  | 'conditionParamsInvalid'
  | 'eventTypeUnknown'
  | 'scenarioIdUnknown'
  | 'versionInvalid'
  | 'publishDisabledRule'
  | 'applicabilityInvalid'

export type RiskRuleConfigValidationIssue = {
  severity: RiskRuleConfigValidationSeverity
  key: RiskRuleConfigValidationMessageKey
  field?: string
  meta?: Record<string, string | number>
}

export type RiskRuleConfigValidationResult = {
  blocking: RiskRuleConfigValidationIssue[]
  warnings: RiskRuleConfigValidationIssue[]
  canSaveDraft: boolean
  canPublish: boolean
}
