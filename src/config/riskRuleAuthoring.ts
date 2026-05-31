import type { RiskRuleConditionType } from '../types/riskRuleConfig'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { TelemetryEventType } from '../types/telemetry'
import { RISK_FLAG_IDS, type RiskFlagId } from '../types/risk'
import { RISK_SCENARIO_IDS, RISK_BANKING_STEP_IDS } from './riskRules'
import {
  FAST_CONFIRMATION_MS,
  FIELD_EDIT_COUNT_THRESHOLD,
  NAVIGATION_LOOP_BACK_COUNT,
} from './thresholds'

export const RISK_RULE_ID_PATTERN = /^[a-z][a-z0-9_]*$/

export const RISK_RULE_SCORE_DELTA_MIN = -100
export const RISK_RULE_SCORE_DELTA_MAX = 100
export const RISK_RULE_SCORE_DELTA_WARN_ABS = 30

export const KNOWN_TELEMETRY_EVENT_TYPES: TelemetryEventType[] = [
  'scenario_start',
  'screen_view',
  'button_click',
  'scenario_exit',
  'input_change',
  'warning_view',
  'warning_dismiss',
  'confirm',
  'cancel',
  'signature_approve',
  'signature_reject',
  'recovery_input',
]

export const KNOWN_DISMISS_TYPES = ['continued', 'bypassed', 'cancelled'] as const

export const DEFAULT_RISK_RULE_CONDITION_PARAMS: Record<
  RiskRuleConditionType,
  Record<string, string | number | boolean | string[]>
> = {
  ignored_warning: { dismissTypes: ['continued', 'bypassed'] },
  warning_seen_then_cancelled: {},
  fast_confirmation_in_risky_flow: {
    maxConfirmationDelayMs: FAST_CONFIRMATION_MS,
    requiresElevatedCatalogRisk: true,
  },
  new_recipient_in_risky_scenario: {
    screenId: RISK_BANKING_STEP_IDS.newRecipient,
    requiresElevatedCatalogRisk: true,
  },
  repeated_field_edits: { minFieldEditCount: FIELD_EDIT_COUNT_THRESHOLD },
  multiple_back_navigation_loops: { minBackNavigationCount: NAVIGATION_LOOP_BACK_COUNT },
  recovery_phrase_entered: { eventType: 'recovery_input' },
  malicious_approval_signed: { scenarioId: RISK_SCENARIO_IDS.walletMaliciousApproval },
  signature_rejected_after_warning: { afterEventType: 'signature_reject' },
  user_stopped_after_warning: { dismissTypes: ['cancelled'] },
}

export const CANONICAL_RISK_FLAG_IDS = [...RISK_FLAG_IDS] as const

/** Canonical flag id used by runtime registry (override key + ruleHits). */
export function resolveRuntimeRuleFlagId(doc: RiskRuleConfigDocument): RiskFlagId {
  if (CANONICAL_RISK_FLAG_IDS.includes(doc.ruleId as RiskFlagId)) {
    return doc.ruleId as RiskFlagId
  }
  const emitted = doc.emittedRiskFlags[0]
  if (emitted && CANONICAL_RISK_FLAG_IDS.includes(emitted)) {
    return emitted
  }
  return doc.ruleId as RiskFlagId
}
