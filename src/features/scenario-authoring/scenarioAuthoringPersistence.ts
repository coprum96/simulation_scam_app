import type {
  ScenarioConfigDocument,
  ScenarioConfigExportBundle,
} from '../../types/scenarioConfig'
import * as cache from '../../registry/registryCache'

/** Read path: in-memory registry cache (hydrated from backend or local migration). */
export function listAuthoredScenarioIds(): string[] {
  return cache.listScenarioIds()
}

export function listAuthoredVersions(scenarioId: string): ScenarioConfigDocument[] {
  return cache.listScenarioVersions(scenarioId)
}

export function getAuthoredDocument(
  scenarioId: string,
  version: number,
): ScenarioConfigDocument | undefined {
  return cache.getScenarioDocument(scenarioId, version)
}

export function getLatestAuthoredDraft(scenarioId: string): ScenarioConfigDocument | undefined {
  return listAuthoredVersions(scenarioId).find((v) => v.status === 'draft')
}

export function getPublishedAuthoredConfig(scenarioId: string): ScenarioConfigDocument | undefined {
  return cache.getPublishedScenarioConfig(scenarioId)
}

export function listPublishedAuthoredConfigs(): ScenarioConfigDocument[] {
  return cache.listPublishedScenarioConfigs()
}

export function buildExportBundle(documents: ScenarioConfigDocument[]): ScenarioConfigExportBundle {
  return {
    exportSchema: 'scenario_config_bundle',
    exportSchemaVersion: 1,
    exportedAt: new Date().toISOString(),
    documents,
  }
}

export function loadAuthoringStoreSnapshot(): {
  schemaVersion: 1
  versionsByScenarioId: Record<string, ScenarioConfigDocument[]>
} {
  const snapshot = cache.getRegistryCacheSnapshot()
  return { schemaVersion: 1, versionsByScenarioId: snapshot.scenarios }
}
