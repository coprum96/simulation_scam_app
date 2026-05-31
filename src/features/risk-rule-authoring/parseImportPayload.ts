import type {
  RiskRuleConfigDocument,
  RiskRuleConfigExportBundle,
} from '../../types/riskRuleConfig'
import { RISK_RULE_CONDITION_TYPES, RISK_RULE_CONFIG_SCHEMA_VERSION } from '../../types/riskRuleConfig'
import { normalizeRiskRuleConfig } from './normalizeRiskRuleConfig'

function isValidDocument(value: unknown): value is RiskRuleConfigDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as RiskRuleConfigDocument
  return (
    doc.schemaVersion === RISK_RULE_CONFIG_SCHEMA_VERSION &&
    typeof doc.ruleId === 'string' &&
    typeof doc.version === 'number' &&
    (doc.status === 'draft' || doc.status === 'in_review' || doc.status === 'published') &&
    typeof doc.title === 'string' &&
    typeof doc.description === 'string' &&
    typeof doc.scoreDelta === 'number' &&
    Array.isArray(doc.emittedRiskFlags) &&
    doc.condition !== null &&
    typeof doc.condition === 'object' &&
    typeof doc.condition.type === 'string' &&
    RISK_RULE_CONDITION_TYPES.includes(doc.condition.type)
  )
}

function normalizeParsed(documents: RiskRuleConfigDocument[]): RiskRuleConfigDocument[] {
  return documents.map((doc) => normalizeRiskRuleConfig(doc))
}

export function parseRiskRuleConfigImportPayload(parsed: unknown): RiskRuleConfigDocument[] | null {
  if (Array.isArray(parsed)) {
    if (!parsed.every(isValidDocument)) return null
    return normalizeParsed(parsed as RiskRuleConfigDocument[])
  }
  if (!parsed || typeof parsed !== 'object') return null

  const bundle = parsed as RiskRuleConfigExportBundle
  if (bundle.exportSchema === 'risk_rule_config_bundle' && Array.isArray(bundle.documents)) {
    if (!bundle.documents.every(isValidDocument)) return null
    return normalizeParsed(bundle.documents)
  }

  return isValidDocument(parsed) ? normalizeParsed([parsed as RiskRuleConfigDocument]) : null
}
