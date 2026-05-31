import { RISK_RULE_DELTAS } from '../../config'
import { DEFAULT_RISK_RULE_CONDITION_PARAMS } from '../../config/riskRuleAuthoring'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import { RISK_RULE_CONFIG_SCHEMA_VERSION } from '../../types/riskRuleConfig'

export function defaultRiskRuleTemplate(ruleId = 'custom_rule_draft'): RiskRuleConfigDocument {
  const now = new Date().toISOString()
  return {
    schemaVersion: RISK_RULE_CONFIG_SCHEMA_VERSION,
    ruleId,
    version: 1,
    status: 'draft',
    enabled: true,
    title: '',
    description: '',
    applicability: { simulatorType: 'all', catalogRiskScope: 'any' },
    condition: {
      type: 'ignored_warning',
      params: { ...DEFAULT_RISK_RULE_CONDITION_PARAMS.ignored_warning },
    },
    scoreDelta: RISK_RULE_DELTAS.ignored_warning,
    emittedRiskFlags: ['ignored_warning'],
    levelHint: 'auto',
    createdAt: now,
    updatedAt: now,
  }
}
