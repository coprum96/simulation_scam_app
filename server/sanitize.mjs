const SCENARIO_SCHEMA_VERSION = 1
const RISK_RULE_SCHEMA_VERSION = 1

const REVIEW_STATES = ['draft', 'in_review', 'published']

function isValidScenario(doc) {
  return (
    doc &&
    typeof doc === 'object' &&
    doc.schemaVersion === SCENARIO_SCHEMA_VERSION &&
    typeof doc.scenarioId === 'string' &&
    typeof doc.version === 'number' &&
    REVIEW_STATES.includes(doc.status) &&
    Array.isArray(doc.steps) &&
    doc.metadata &&
    typeof doc.metadata === 'object'
  )
}

function isValidRiskRule(doc) {
  return (
    doc &&
    typeof doc === 'object' &&
    doc.schemaVersion === RISK_RULE_SCHEMA_VERSION &&
    typeof doc.ruleId === 'string' &&
    typeof doc.version === 'number' &&
    REVIEW_STATES.includes(doc.status) &&
    typeof doc.title === 'string' &&
    doc.condition &&
    typeof doc.condition === 'object' &&
    typeof doc.condition.type === 'string'
  )
}

function isValidAuditEvent(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    (entry.entityType === 'scenario' || entry.entityType === 'risk_rule') &&
    typeof entry.entityId === 'string' &&
    typeof entry.version === 'number' &&
    typeof entry.action === 'string' &&
    entry.actor &&
    typeof entry.actor.id === 'string' &&
    typeof entry.timestamp === 'string'
  )
}

export function sanitizeStore(store) {
  const scenarios = {}
  const riskRules = {}
  for (const [id, versions] of Object.entries(store.scenarios ?? {})) {
    if (!Array.isArray(versions)) continue
    const valid = versions.filter(isValidScenario)
    if (valid.length > 0) scenarios[id] = valid
  }
  for (const [id, versions] of Object.entries(store.riskRules ?? {})) {
    if (!Array.isArray(versions)) continue
    const valid = versions.filter(isValidRiskRule)
    if (valid.length > 0) riskRules[id] = valid
  }
  return {
    schemaVersion: 1,
    scenarios,
    riskRules,
    auditLog: (store.auditLog ?? []).filter(isValidAuditEvent),
    migratedFromLocalAt: store.migratedFromLocalAt ?? null,
  }
}
