import {
  FAST_CONFIRMATION_MS,
  FIELD_EDIT_COUNT_THRESHOLD,
  NAVIGATION_LOOP_BACK_COUNT,
  RISK_BANKING_STEP_IDS,
  RISK_RULE_DELTAS,
} from '../../config'
import type { RiskFlagId } from '../../types/risk'
import {
  catalogRiskIsElevated,
  hasDismissType,
  hasEventAfterWarning,
  isMaliciousApprovalScenario,
  userConfirmedAction,
  visitedScreen,
} from './riskRuleHelpers'
import type { RiskRuleDefinition } from './riskRuleTypes'

const D = RISK_RULE_DELTAS

/** Built-in MVP rules (code-defined). Authored published rules may override by ruleId. */
export const BUILTIN_RISK_RULE_DEFINITIONS: RiskRuleDefinition[] = [
  {
    id: 'ignored_warning',
    delta: D.ignored_warning,
    source: 'builtin',
    condition: ({ events, summary }) =>
      summary.warningsIgnored > 0 ||
      hasDismissType(events, 'continued') ||
      hasDismissType(events, 'bypassed'),
  },
  {
    id: 'warning_seen_then_cancelled',
    delta: D.warning_seen_then_cancelled,
    source: 'builtin',
    condition: ({ summary, record, events }) =>
      summary.warningsSeen > 0 &&
      record.outcome === 'stopped' &&
      (summary.eventCounts.cancel > 0 || hasDismissType(events, 'cancelled')),
  },
  {
    id: 'fast_confirmation_in_risky_flow',
    delta: D.fast_confirmation_in_risky_flow,
    source: 'builtin',
    condition: ({ summary, scenario, events }) =>
      catalogRiskIsElevated(scenario) &&
      summary.confirmationDelayMs !== null &&
      summary.confirmationDelayMs < FAST_CONFIRMATION_MS &&
      events.some(
        (e) => e.eventType === 'confirm' || e.eventType === 'signature_approve',
      ),
  },
  {
    id: 'new_recipient_in_risky_scenario',
    delta: D.new_recipient_in_risky_scenario,
    source: 'builtin',
    condition: ({ events, scenario }) =>
      catalogRiskIsElevated(scenario) &&
      scenario.steps.includes(RISK_BANKING_STEP_IDS.newRecipient) &&
      visitedScreen(events, RISK_BANKING_STEP_IDS.newRecipient),
  },
  {
    id: 'repeated_field_edits',
    delta: D.repeated_field_edits,
    source: 'builtin',
    condition: ({ summary }) => summary.fieldEditCount >= FIELD_EDIT_COUNT_THRESHOLD,
  },
  {
    id: 'multiple_back_navigation_loops',
    delta: D.multiple_back_navigation_loops,
    source: 'builtin',
    condition: ({ summary }) =>
      summary.backNavigationCount >= NAVIGATION_LOOP_BACK_COUNT,
  },
  {
    id: 'recovery_phrase_entered',
    delta: D.recovery_phrase_entered,
    source: 'builtin',
    condition: ({ summary }) => summary.eventCounts.recovery_input > 0,
  },
  {
    id: 'malicious_approval_signed',
    delta: D.malicious_approval_signed,
    source: 'builtin',
    condition: ({ scenario, events, record }) =>
      isMaliciousApprovalScenario(scenario) && userConfirmedAction(events, record),
  },
  {
    id: 'signature_rejected_after_warning',
    delta: D.signature_rejected_after_warning,
    source: 'builtin',
    condition: ({ events }) =>
      hasEventAfterWarning(events, (e) => e.eventType === 'signature_reject'),
  },
  {
    id: 'user_stopped_after_warning',
    delta: D.user_stopped_after_warning,
    source: 'builtin',
    condition: ({ events, summary, record }) =>
      summary.warningsSeen > 0 &&
      (hasDismissType(events, 'cancelled') ||
        (record.outcome === 'stopped' && summary.eventCounts.cancel > 0)),
  },
]

export function listBuiltinRiskRuleIds(): RiskFlagId[] {
  return BUILTIN_RISK_RULE_DEFINITIONS.map((r) => r.id)
}
