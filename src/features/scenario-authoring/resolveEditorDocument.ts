import type { ScenarioConfigDocument } from '../../types/scenarioConfig'
import type { SimulatorType } from '../../types/scenario'
import {
  getBuiltinScenarioConfig,
  isBuiltinScenarioId,
} from './builtinScenarioToConfig'
import { createDefaultScenarioConfig } from './defaultScenarioTemplate'
import { normalizeScenarioConfigDocument } from './normalizeScenarioConfig'
import { getAuthoredDocument, listAuthoredVersions } from './scenarioAuthoringPersistence'

export function resolveEditorDocument(input: {
  routeScenarioId: string | undefined
  isNew: boolean
  cloneBuiltin: boolean
  versionParam: number
  simulatorParam: SimulatorType | null
  idParam: string | null
}): ScenarioConfigDocument {
  const finish = (doc: ScenarioConfigDocument) => normalizeScenarioConfigDocument(doc)

  if (input.isNew) {
    const simulatorType = input.simulatorParam ?? 'banking'
    const id = input.idParam?.trim() || `custom_${simulatorType}_${Date.now()}`
    return finish(createDefaultScenarioConfig(id, simulatorType))
  }

  const scenarioId = input.routeScenarioId ?? ''

  if (input.cloneBuiltin && isBuiltinScenarioId(scenarioId)) {
    const base = getBuiltinScenarioConfig(scenarioId)
    if (!base) return finish(createDefaultScenarioConfig(`copy_${scenarioId}`, 'banking'))
    return finish({
      ...structuredClone(base),
      scenarioId: `copy_${scenarioId}`,
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const versions = listAuthoredVersions(scenarioId)
  if (Number.isFinite(input.versionParam) && input.versionParam > 0) {
    const found = getAuthoredDocument(scenarioId, input.versionParam)
    if (found) return finish(structuredClone(found))
  }
  const draft = versions.find((v) => v.status === 'draft')
  if (draft) return finish(structuredClone(draft))
  const published = versions.find((v) => v.status === 'published')
  if (published) return finish(structuredClone(published))
  if (isBuiltinScenarioId(scenarioId)) {
    const builtin = getBuiltinScenarioConfig(scenarioId)
    if (builtin) return finish(structuredClone(builtin))
  }
  return finish(createDefaultScenarioConfig(scenarioId, 'banking'))
}

export function isBuiltinReadOnlyView(
  routeScenarioId: string | undefined,
  isNew: boolean,
  cloneBuiltin: boolean,
): boolean {
  if (isNew || cloneBuiltin || !routeScenarioId) return false
  if (!isBuiltinScenarioId(routeScenarioId)) return false
  return listAuthoredVersions(routeScenarioId).length === 0
}
