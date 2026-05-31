import { RISK_RULE_DELTAS } from '../../config'
import { DEFAULT_RISK_RULE_CONDITION_PARAMS } from '../../config/riskRuleAuthoring'
import { ru } from '../../content/ru'
import type { RiskFlagId } from '../../types/risk'
import type { RiskRuleConfigDocument, RiskRuleConditionType } from '../../types/riskRuleConfig'
import { RISK_RULE_CONFIG_SCHEMA_VERSION } from '../../types/riskRuleConfig'
import { listBuiltinRiskRuleIds } from '../risk-engine/builtinRiskRuleDefinitions'

const BUILTIN_APPLICABILITY: Record<
  RiskFlagId,
  RiskRuleConfigDocument['applicability']
> = {
  ignored_warning: { simulatorType: 'all', catalogRiskScope: 'any' },
  warning_seen_then_cancelled: { simulatorType: 'all', catalogRiskScope: 'any' },
  fast_confirmation_in_risky_flow: { simulatorType: 'all', catalogRiskScope: 'elevated' },
  new_recipient_in_risky_scenario: { simulatorType: 'banking', catalogRiskScope: 'elevated' },
  repeated_field_edits: { simulatorType: 'all', catalogRiskScope: 'any' },
  multiple_back_navigation_loops: { simulatorType: 'all', catalogRiskScope: 'any' },
  recovery_phrase_entered: { simulatorType: 'wallet', catalogRiskScope: 'any' },
  malicious_approval_signed: {
    simulatorType: 'wallet',
    catalogRiskScope: 'any',
    scenarioIds: ['wallet_malicious_approval'],
  },
  signature_rejected_after_warning: { simulatorType: 'wallet', catalogRiskScope: 'any' },
  user_stopped_after_warning: { simulatorType: 'all', catalogRiskScope: 'any' },
}

function conditionTypeForBuiltin(ruleId: RiskFlagId): RiskRuleConditionType {
  return ruleId as RiskRuleConditionType
}

export function builtinRiskRuleToConfig(ruleId: RiskFlagId, version = 1): RiskRuleConfigDocument {
  const copy = ru.risk.rules[ruleId]
  const conditionType = conditionTypeForBuiltin(ruleId)
  const params = DEFAULT_RISK_RULE_CONDITION_PARAMS[conditionType]
  const now = new Date().toISOString()
  return {
    schemaVersion: RISK_RULE_CONFIG_SCHEMA_VERSION,
    ruleId,
    version,
    status: 'published',
    enabled: true,
    title: copy.label,
    description: copy.description,
    applicability: BUILTIN_APPLICABILITY[ruleId],
    condition: { type: conditionType, params: { ...params } },
    scoreDelta: RISK_RULE_DELTAS[ruleId],
    emittedRiskFlags: [ruleId],
    levelHint: 'auto',
    createdAt: now,
    updatedAt: now,
  }
}

export function getBuiltinRiskRuleConfig(ruleId: string): RiskRuleConfigDocument | undefined {
  if (!listBuiltinRiskRuleIds().includes(ruleId as RiskFlagId)) return undefined
  return builtinRiskRuleToConfig(ruleId as RiskFlagId)
}

export function listBuiltinRiskRuleIdsForAuthoring(): RiskFlagId[] {
  return listBuiltinRiskRuleIds()
}

export function isBuiltinRiskRuleId(ruleId: string): boolean {
  return listBuiltinRiskRuleIds().includes(ruleId as RiskFlagId)
}
