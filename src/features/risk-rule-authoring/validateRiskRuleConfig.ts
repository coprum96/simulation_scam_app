import {
  CANONICAL_RISK_FLAG_IDS,
  KNOWN_DISMISS_TYPES,
  KNOWN_TELEMETRY_EVENT_TYPES,
  RISK_RULE_ID_PATTERN,
  RISK_RULE_SCORE_DELTA_MAX,
  RISK_RULE_SCORE_DELTA_MIN,
  RISK_RULE_SCORE_DELTA_WARN_ABS,
} from '../../config/riskRuleAuthoring'
import { RISK_RULE_CONDITION_TYPES } from '../../types/riskRuleConfig'
import type {
  RiskRuleConfigDocument,
  RiskRuleConfigValidationIssue,
  RiskRuleConfigValidationResult,
} from '../../types/riskRuleConfig'
import { listBuiltinRiskRuleIdsForAuthoring } from './builtinRiskRuleToConfig'

function issue(
  severity: RiskRuleConfigValidationIssue['severity'],
  key: RiskRuleConfigValidationIssue['key'],
  field?: string,
  meta?: Record<string, string | number>,
): RiskRuleConfigValidationIssue {
  return { severity, key, field, meta }
}

function validateConditionParams(doc: RiskRuleConfigDocument): RiskRuleConfigValidationIssue[] {
  const issues: RiskRuleConfigValidationIssue[] = []
  const { type, params } = doc.condition
  if (!RISK_RULE_CONDITION_TYPES.includes(type)) {
    issues.push(issue('blocking', 'conditionTypeRequired', 'condition.type'))
    return issues
  }

  if (type === 'fast_confirmation_in_risky_flow') {
    const ms = params?.maxConfirmationDelayMs
    if (ms !== undefined && (typeof ms !== 'number' || ms <= 0)) {
      issues.push(issue('blocking', 'conditionParamsInvalid', 'condition.params.maxConfirmationDelayMs'))
    }
  }

  if (type === 'repeated_field_edits') {
    const min = params?.minFieldEditCount
    if (min !== undefined && (typeof min !== 'number' || min < 1)) {
      issues.push(issue('blocking', 'conditionParamsInvalid', 'condition.params.minFieldEditCount'))
    }
  }

  if (type === 'multiple_back_navigation_loops') {
    const min = params?.minBackNavigationCount
    if (min !== undefined && (typeof min !== 'number' || min < 1)) {
      issues.push(issue('blocking', 'conditionParamsInvalid', 'condition.params.minBackNavigationCount'))
    }
  }

  if (type === 'recovery_phrase_entered' && params?.eventType) {
    if (!KNOWN_TELEMETRY_EVENT_TYPES.includes(params.eventType)) {
      issues.push(issue('blocking', 'eventTypeUnknown', 'condition.params.eventType'))
    }
  }

  if (type === 'signature_rejected_after_warning' && params?.afterEventType) {
    if (!KNOWN_TELEMETRY_EVENT_TYPES.includes(params.afterEventType)) {
      issues.push(issue('blocking', 'eventTypeUnknown', 'condition.params.afterEventType'))
    }
  }

  if (
    (type === 'ignored_warning' || type === 'user_stopped_after_warning') &&
    params?.dismissTypes
  ) {
    for (const dt of params.dismissTypes) {
      if (!KNOWN_DISMISS_TYPES.includes(dt as (typeof KNOWN_DISMISS_TYPES)[number])) {
        issues.push(issue('warning', 'conditionParamsInvalid', 'condition.params.dismissTypes', {
          value: dt,
        }))
      }
    }
  }

  if (type === 'malicious_approval_signed' && !params?.scenarioId) {
    issues.push(issue('warning', 'scenarioIdUnknown', 'condition.params.scenarioId'))
  }

  return issues
}

const CATALOG_RISK_SCOPES = ['any', 'elevated', 'low', 'medium', 'high'] as const

export function validateRiskRuleConfig(
  doc: RiskRuleConfigDocument,
  options?: {
    forPublish?: boolean
    allowBuiltinOverride?: boolean
  },
): RiskRuleConfigValidationResult {
  const blocking: RiskRuleConfigValidationIssue[] = []
  const warnings: RiskRuleConfigValidationIssue[] = []

  if (!doc.ruleId?.trim()) {
    blocking.push(issue('blocking', 'ruleIdRequired', 'ruleId'))
  } else if (!RISK_RULE_ID_PATTERN.test(doc.ruleId)) {
    blocking.push(issue('blocking', 'ruleIdFormat', 'ruleId'))
  }

  if (!doc.title?.trim()) blocking.push(issue('blocking', 'titleRequired', 'title'))
  if (!doc.description?.trim()) blocking.push(issue('blocking', 'descriptionRequired', 'description'))

  if (!Number.isFinite(doc.scoreDelta)) {
    blocking.push(issue('blocking', 'scoreDeltaInvalid', 'scoreDelta'))
  } else if (doc.scoreDelta < RISK_RULE_SCORE_DELTA_MIN || doc.scoreDelta > RISK_RULE_SCORE_DELTA_MAX) {
    blocking.push(issue('blocking', 'scoreDeltaInvalid', 'scoreDelta'))
  } else if (Math.abs(doc.scoreDelta) > RISK_RULE_SCORE_DELTA_WARN_ABS) {
    warnings.push(issue('warning', 'scoreDeltaExtreme', 'scoreDelta'))
  }

  if (!doc.emittedRiskFlags?.length) {
    blocking.push(issue('blocking', 'emittedFlagsRequired', 'emittedRiskFlags'))
  } else {
    for (const flag of doc.emittedRiskFlags) {
      if (!CANONICAL_RISK_FLAG_IDS.includes(flag)) {
        blocking.push(issue('blocking', 'emittedFlagUnknown', 'emittedRiskFlags', { flag }))
      }
    }
    if (
      doc.ruleId &&
      CANONICAL_RISK_FLAG_IDS.includes(doc.ruleId as (typeof CANONICAL_RISK_FLAG_IDS)[number]) &&
      !doc.emittedRiskFlags.includes(doc.ruleId as (typeof doc.emittedRiskFlags)[number])
    ) {
      warnings.push(issue('warning', 'emittedFlagMissingRuleId', 'emittedRiskFlags'))
    }
  }

  if (!doc.version || doc.version < 1) {
    blocking.push(issue('blocking', 'versionInvalid', 'version'))
  }

  if (
    options?.forPublish &&
    doc.ruleId &&
    !CANONICAL_RISK_FLAG_IDS.includes(doc.ruleId as (typeof CANONICAL_RISK_FLAG_IDS)[number])
  ) {
    blocking.push(issue('blocking', 'ruleIdFormat', 'ruleId'))
  }

  if (options?.forPublish && !doc.enabled) {
    blocking.push(issue('blocking', 'publishDisabledRule', 'enabled'))
  }

  if (
    options?.forPublish &&
    listBuiltinRiskRuleIdsForAuthoring().includes(doc.ruleId as never) &&
    options.allowBuiltinOverride !== false
  ) {
    warnings.push(issue('warning', 'ruleIdBuiltinOverrideHint', 'ruleId'))
  }

  blocking.push(...validateConditionParams(doc))

  const sim = doc.applicability?.simulatorType
  if (!sim || !['all', 'banking', 'wallet'].includes(sim)) {
    blocking.push(issue('blocking', 'applicabilityInvalid', 'applicability.simulatorType'))
  }

  const catalogScope = doc.applicability?.catalogRiskScope
  if (
    !catalogScope ||
    !CATALOG_RISK_SCOPES.includes(catalogScope as (typeof CATALOG_RISK_SCOPES)[number])
  ) {
    blocking.push(issue('blocking', 'applicabilityInvalid', 'applicability.catalogRiskScope'))
  }

  const hasBlocking = blocking.length > 0
  const canPublish = !hasBlocking && (!options?.forPublish || doc.enabled)

  return {
    blocking,
    warnings,
    canSaveDraft: !hasBlocking,
    canPublish,
  }
}

export function validateImportDocuments(
  documents: RiskRuleConfigDocument[],
): { valid: boolean; documents: RiskRuleConfigDocument[] } {
  for (const doc of documents) {
    const result = validateRiskRuleConfig(doc)
    if (!result.canSaveDraft) return { valid: false, documents: [] }
  }
  return { valid: true, documents }
}
