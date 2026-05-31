import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import { resolveRuntimeRuleFlagId } from './riskRuleRuntimeId'
import {
  evaluateDeclarativeRiskCondition,
  matchesRiskRuleApplicability,
} from './evaluateDeclarativeRiskCondition'
import type { RiskRuleDefinition } from './riskRuleTypes'

export function riskRuleConfigToRuntime(doc: RiskRuleConfigDocument): RiskRuleDefinition {
  const primaryFlag = resolveRuntimeRuleFlagId(doc)
  return {
    id: primaryFlag,
    delta: doc.scoreDelta,
    source: 'authored',
    condition: (ctx) => {
      if (!doc.enabled) return false
      if (!matchesRiskRuleApplicability(doc.applicability, ctx)) return false
      return evaluateDeclarativeRiskCondition(doc.condition, ctx)
    },
  }
}
