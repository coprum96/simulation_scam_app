import type { Scenario } from '../../types/scenario'
import type { ScenarioConfigDocument } from '../../types/scenarioConfig'
import { defaultScreenIdForStep } from '../../config/scenarioAuthoring'

/**
 * Maps authored config → runtime Scenario for existing banking/wallet flows.
 * Execution layer reads only linear step order + catalog metadata.
 */
export function authoredConfigToRuntimeScenario(config: ScenarioConfigDocument): Scenario {
  const { metadata } = config
  const steps = config.steps.map((step) => step.stepId)
  const hasWarningStep = steps.includes('warning')

  return {
    id: config.scenarioId,
    title: metadata.title,
    description: metadata.description,
    simulatorType: metadata.simulatorType,
    riskLevel: metadata.riskLevel,
    targetProfileIds: [...metadata.targetProfileIds],
    steps,
    warningsEnabled: metadata.warningsEnabled ?? hasWarningStep,
    warningKeys: [...metadata.warningKeys],
    expectedRiskFlags: [...metadata.expectedRiskFlags],
  }
}

/** Normalizes screenId from step definition (fallback mapping for legacy edits). */
export function resolveStepScreenId(
  step: ScenarioConfigDocument['steps'][number],
  simulatorType: Scenario['simulatorType'],
): string {
  return step.screenId.trim() || defaultScreenIdForStep(step.stepId, simulatorType)
}
