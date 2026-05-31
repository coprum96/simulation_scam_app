import { RISK_RULE_CONFIG_SCHEMA_VERSION } from '../types/riskRuleConfig'
import { SCENARIO_CONFIG_SCHEMA_VERSION } from '../types/scenarioConfig'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'
import type { RegistrySnapshot } from './types'
import { AUTHORING_REVIEW_STATES } from '../types/authoringLifecycle'

function isValidScenarioDocument(value: unknown): value is ScenarioConfigDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as ScenarioConfigDocument
  return (
    doc.schemaVersion === SCENARIO_CONFIG_SCHEMA_VERSION &&
    typeof doc.scenarioId === 'string' &&
    typeof doc.version === 'number' &&
    (AUTHORING_REVIEW_STATES as readonly string[]).includes(doc.status) &&
    Array.isArray(doc.steps) &&
    doc.metadata !== null &&
    typeof doc.metadata === 'object'
  )
}

function isValidRiskRuleDocument(value: unknown): value is RiskRuleConfigDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as RiskRuleConfigDocument
  return (
    doc.schemaVersion === RISK_RULE_CONFIG_SCHEMA_VERSION &&
    typeof doc.ruleId === 'string' &&
    typeof doc.version === 'number' &&
    (AUTHORING_REVIEW_STATES as readonly string[]).includes(doc.status) &&
    typeof doc.title === 'string' &&
    doc.condition !== null &&
    typeof doc.condition === 'object' &&
    typeof doc.condition.type === 'string'
  )
}

export function sanitizeRegistrySnapshot(snapshot: RegistrySnapshot): RegistrySnapshot {
  const scenarios: RegistrySnapshot['scenarios'] = {}
  const riskRules: RegistrySnapshot['riskRules'] = {}

  for (const [id, versions] of Object.entries(snapshot.scenarios ?? {})) {
    if (!Array.isArray(versions)) continue
    const valid = versions.filter(isValidScenarioDocument)
    if (valid.length > 0) scenarios[id] = valid
  }

  for (const [id, versions] of Object.entries(snapshot.riskRules ?? {})) {
    if (!Array.isArray(versions)) continue
    const valid = versions.filter(isValidRiskRuleDocument)
    if (valid.length > 0) riskRules[id] = valid
  }

  return {
    schemaVersion: 1,
    scenarios,
    riskRules,
    auditLog: snapshot.auditLog ?? [],
    migratedFromLocalAt: snapshot.migratedFromLocalAt ?? null,
  }
}
