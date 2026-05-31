import type { Scenario } from '../types/scenario'
import type { ScenarioId } from '../types/scenario'
import { listPublishedAuthoredConfigs } from '../features/scenario-authoring/scenarioAuthoringPersistence'
import { authoredConfigToRuntimeScenario } from '../features/scenario-authoring/scenarioConfigToRuntime'
import { mockScenarios } from './scenariosCatalog'

/**
 * Runtime catalog: built-in scenarios + published authored configs.
 */
export function listRuntimeScenarios(): Scenario[] {
  const builtinIds = new Set(mockScenarios.map((s) => s.id))
  const authored = listPublishedAuthoredConfigs()
    .map(authoredConfigToRuntimeScenario)
    .filter((s) => !builtinIds.has(s.id))
  return [...mockScenarios, ...authored]
}

export function getScenarioById(id: string): Scenario | undefined {
  return listRuntimeScenarios().find((s) => s.id === id)
}

export function getScenarioByIdStrict(id: ScenarioId): Scenario {
  const scenario = getScenarioById(id)
  if (!scenario) {
    throw new Error(`Unknown scenario: ${id}`)
  }
  return scenario
}
