import type { ScenarioConfigDocument, ScenarioConfigExportBundle } from '../../types/scenarioConfig'
import { SCENARIO_CONFIG_SCHEMA_VERSION } from '../../types/scenarioConfig'
import { normalizeScenarioConfigDocument } from './normalizeScenarioConfig'

function isValidDocument(value: unknown): value is ScenarioConfigDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as ScenarioConfigDocument
  return (
    doc.schemaVersion === SCENARIO_CONFIG_SCHEMA_VERSION &&
    typeof doc.scenarioId === 'string' &&
    typeof doc.version === 'number' &&
    (doc.status === 'draft' || doc.status === 'in_review' || doc.status === 'published') &&
    Array.isArray(doc.steps) &&
    doc.metadata !== null &&
    typeof doc.metadata === 'object' &&
    typeof doc.metadata.title === 'string' &&
    typeof doc.metadata.simulatorType === 'string'
  )
}

function normalizeParsed(documents: ScenarioConfigDocument[]): ScenarioConfigDocument[] {
  return documents.map((doc) => normalizeScenarioConfigDocument(doc))
}

export function parseScenarioConfigImportPayload(raw: unknown): ScenarioConfigDocument[] | null {
  if (Array.isArray(raw)) {
    if (!raw.every(isValidDocument)) return null
    return normalizeParsed(raw as ScenarioConfigDocument[])
  }
  if (!raw || typeof raw !== 'object') return null

  const bundle = raw as ScenarioConfigExportBundle
  if (bundle.exportSchema === 'scenario_config_bundle' && Array.isArray(bundle.documents)) {
    if (!bundle.documents.every(isValidDocument)) return null
    return normalizeParsed(bundle.documents)
  }

  return isValidDocument(raw)
    ? normalizeParsed([raw as ScenarioConfigDocument])
    : null
}
