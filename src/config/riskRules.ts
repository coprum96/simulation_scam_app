import type { RiskFlagId } from '../types/risk'

/** Score delta по каждому правилу MVP (см. project-docs/RISK_RULES.md) */
export const RISK_RULE_DELTAS: Record<RiskFlagId, number> = {
  ignored_warning: 20,
  warning_seen_then_cancelled: -10,
  fast_confirmation_in_risky_flow: 15,
  new_recipient_in_risky_scenario: 10,
  repeated_field_edits: 10,
  multiple_back_navigation_loops: 10,
  recovery_phrase_entered: 25,
  malicious_approval_signed: 25,
  signature_rejected_after_warning: -10,
  user_stopped_after_warning: -10,
}

/** Scenario ids, используемые в условиях правил */
export const RISK_SCENARIO_IDS = {
  walletMaliciousApproval: 'wallet_malicious_approval',
} as const

/** Step/screen id для banking new recipient */
export const RISK_BANKING_STEP_IDS = {
  newRecipient: 'new_recipient',
} as const
