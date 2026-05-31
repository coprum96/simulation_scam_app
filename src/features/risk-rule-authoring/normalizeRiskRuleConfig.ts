import { DEFAULT_RISK_RULE_CONDITION_PARAMS } from '../../config/riskRuleAuthoring'
import {
  RISK_RULE_CONDITION_TYPES,
  type RiskRuleConditionType,
} from '../../types/riskRuleConfig'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import { RISK_RULE_CONFIG_SCHEMA_VERSION } from '../../types/riskRuleConfig'
import { CANONICAL_RISK_FLAG_IDS, resolveRuntimeRuleFlagId } from '../../config/riskRuleAuthoring'
import type { RiskFlagId } from '../../types/risk'

function resolveConditionType(type: string): RiskRuleConditionType {
  if (RISK_RULE_CONDITION_TYPES.includes(type as RiskRuleConditionType)) {
    return type as RiskRuleConditionType
  }
  return 'ignored_warning'
}

export function normalizeRiskRuleConfig(doc: RiskRuleConfigDocument): RiskRuleConfigDocument {
  const conditionType = resolveConditionType(doc.condition?.type ?? 'ignored_warning')
  const defaultParams = DEFAULT_RISK_RULE_CONDITION_PARAMS[conditionType]
  const mergedParams = {
    ...defaultParams,
    ...(doc.condition?.params ?? {}),
  }

  const normalized: RiskRuleConfigDocument = {
    ...doc,
    schemaVersion: RISK_RULE_CONFIG_SCHEMA_VERSION,
    condition: {
      type: conditionType,
      params: mergedParams,
    },
    applicability: {
      simulatorType: doc.applicability?.simulatorType ?? 'all',
      catalogRiskScope: doc.applicability?.catalogRiskScope ?? 'any',
      scenarioIds: doc.applicability?.scenarioIds?.filter(Boolean),
    },
    emittedRiskFlags:
      doc.emittedRiskFlags?.length > 0
        ? [...new Set(doc.emittedRiskFlags)]
        : CANONICAL_RISK_FLAG_IDS.includes(doc.ruleId as RiskFlagId)
          ? [doc.ruleId as RiskFlagId]
          : [],
  }

  const runtimeId = resolveRuntimeRuleFlagId(normalized)
  if (!normalized.emittedRiskFlags.includes(runtimeId)) {
    normalized.emittedRiskFlags = [runtimeId, ...normalized.emittedRiskFlags]
  }

  return normalized
}
