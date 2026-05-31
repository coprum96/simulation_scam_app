import { defaultScreenIdForStep } from '../../config/scenarioAuthoring'
import type { ScenarioConfigDocument, ScenarioConfigStep } from '../../types/scenarioConfig'

/** Ensures each action has a nextByAction entry; drops orphan keys (legacy imports). */
export function normalizeScenarioStep(
  step: ScenarioConfigStep,
  simulatorType: ScenarioConfigDocument['metadata']['simulatorType'],
): ScenarioConfigStep {
  const nextByAction: Record<string, string> = {}
  for (const action of step.actions) {
    const raw = step.nextByAction[action.actionId]
    nextByAction[action.actionId] = typeof raw === 'string' ? raw : ''
  }

  return {
    ...step,
    screenId: step.screenId || defaultScreenIdForStep(step.stepId, simulatorType),
    nextByAction,
  }
}

export function normalizeScenarioConfigDocument(
  document: ScenarioConfigDocument,
): ScenarioConfigDocument {
  return {
    ...document,
    steps: document.steps.map((step) => normalizeScenarioStep(step, document.metadata.simulatorType)),
  }
}
