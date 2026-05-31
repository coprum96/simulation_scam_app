import {
  DEFAULT_RISK_RULE_CONDITION_PARAMS,
  resolveRuntimeRuleFlagId,
} from '../../config/riskRuleAuthoring'
import { ru } from '../../content/ru'
import { levelHintFromDelta } from '../risk-engine/evaluateDeclarativeRiskCondition'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import type { RiskLevel } from '../../types/risk'

export type RiskRulePreviewSummary = {
  scoreContribution: number
  runtimeRuleId: string
  emittedFlagsLabels: string[]
  logicSummary: string
  levelHintLabel: string
}

function conditionSummary(doc: RiskRuleConfigDocument): string {
  const key = doc.condition.type
  const msg = ru.riskRuleAuthoring.conditionSummaries[key]
  if (!msg) return key
  const defaults = DEFAULT_RISK_RULE_CONDITION_PARAMS[key] ?? {}
  const params = { ...defaults, ...(doc.condition.params ?? {}) }
  return msg.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name as keyof typeof params]
    if (value === undefined) return '—'
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  })
}

function applicabilitySummary(doc: RiskRuleConfigDocument): string {
  const { simulatorType, catalogRiskScope, scenarioIds } = doc.applicability
  const parts: string[] = []
  parts.push(
    simulatorType === 'all'
      ? ru.riskRuleAuthoring.applicabilitySimulatorAll
      : ru.riskRuleAuthoring.applicabilitySimulatorSpecific.replace(
          '{simulator}',
          simulatorType === 'banking'
            ? ru.hub.simulatorBanking
            : ru.hub.simulatorWallet,
        ),
  )
  if (catalogRiskScope === 'elevated') {
    parts.push(ru.riskRuleAuthoring.applicabilityCatalogElevated)
  } else if (catalogRiskScope !== 'any') {
    parts.push(
      ru.riskRuleAuthoring.applicabilityCatalogLevel.replace(
        '{level}',
        ru.riskLevel[catalogRiskScope],
      ),
    )
  }
  if (scenarioIds?.length) {
    parts.push(
      ru.riskRuleAuthoring.applicabilityScenarios.replace(
        '{ids}',
        scenarioIds.join(', '),
      ),
    )
  }
  return parts.join(' · ')
}

export function buildRiskRulePreview(doc: RiskRuleConfigDocument): RiskRulePreviewSummary {
  const runtimeRuleId = resolveRuntimeRuleFlagId(doc)
  const emittedFlagsLabels = doc.emittedRiskFlags.map((id) => {
    const copy = ru.risk.rules[id]
    return copy ? `${copy.label} (${id})` : id
  })

  let levelHintLabel: string
  if (doc.levelHint === 'auto') {
    const inferred: RiskLevel = levelHintFromDelta(doc.scoreDelta)
    levelHintLabel = ru.riskRuleAuthoring.levelHintAuto.replace(
      '{level}',
      ru.riskLevel[inferred],
    )
  } else {
    levelHintLabel = ru.riskLevel[doc.levelHint]
  }

  const logicParts = [
    doc.enabled
      ? ru.riskRuleAuthoring.previewEnabled
      : ru.riskRuleAuthoring.previewDisabled,
    applicabilitySummary(doc),
    conditionSummary(doc),
  ]
  if (!doc.enabled) {
    logicParts.push(ru.riskRuleAuthoring.previewRuntimeSkipped)
  }

  return {
    scoreContribution: doc.enabled ? doc.scoreDelta : 0,
    runtimeRuleId,
    emittedFlagsLabels,
    logicSummary: logicParts.join(' — '),
    levelHintLabel,
  }
}
