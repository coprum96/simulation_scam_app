import type { RiskFlagId } from '../../types/risk'
import { listPublishedRiskRuleConfigs } from '../risk-rule-authoring/riskRuleAuthoringPersistence'
import { BUILTIN_RISK_RULE_DEFINITIONS } from './builtinRiskRuleDefinitions'
import { riskRuleConfigToRuntime } from './riskRuleConfigToRuntime'
import type { RiskRuleDefinition } from './riskRuleTypes'

/**
 * Runtime rule set: built-in MVP rules + published authored overrides (by ruleId).
 * Evaluation-only; does not touch telemetry/replay/export contracts.
 */
export function getRuntimeRiskRules(): RiskRuleDefinition[] {
  const byId = new Map<RiskFlagId, RiskRuleDefinition>()
  for (const rule of BUILTIN_RISK_RULE_DEFINITIONS) {
    byId.set(rule.id, rule)
  }
  for (const doc of listPublishedRiskRuleConfigs()) {
    if (!doc.enabled) continue
    const runtime = riskRuleConfigToRuntime(doc)
    byId.set(runtime.id, runtime)
  }
  return [...byId.values()]
}

/** @deprecated Use getRuntimeRiskRules() — kept for tests/docs referencing static list */
export function getBuiltinRiskRules(): RiskRuleDefinition[] {
  return BUILTIN_RISK_RULE_DEFINITIONS
}
