import { mockScenarios } from '../../data/scenariosCatalog'
import { defaultScreenIdForStep } from '../../config/scenarioAuthoring'
import type { Scenario } from '../../types/scenario'
import type { ScenarioConfigDocument, ScenarioConfigStep } from '../../types/scenarioConfig'
import { SCENARIO_CONFIG_SCHEMA_VERSION } from '../../types/scenarioConfig'

function scenarioStepsToConfigSteps(scenario: Scenario): ScenarioConfigStep[] {
  return scenario.steps.map((stepId, index) => {
    const nextStepId = scenario.steps[index + 1] ?? ''
    return {
      stepId,
      screenId: defaultScreenIdForStep(stepId, scenario.simulatorType),
      title: stepId,
      bodyRef: `scenario.${scenario.id}.steps.${stepId}`,
      actions: [
        { actionId: 'continue', labelRef: 'buttons.continue', kind: 'primary' },
      ],
      nextByAction: { continue: nextStepId },
    }
  })
}

export function builtinScenarioToConfig(scenario: Scenario, version = 1): ScenarioConfigDocument {
  const now = new Date().toISOString()
  return {
    schemaVersion: SCENARIO_CONFIG_SCHEMA_VERSION,
    scenarioId: scenario.id,
    version,
    status: 'published',
    metadata: {
      title: scenario.title,
      description: scenario.description,
      simulatorType: scenario.simulatorType,
      riskLevel: scenario.riskLevel,
      expectedRiskFlags: [...scenario.expectedRiskFlags],
      targetProfileIds: [...scenario.targetProfileIds],
      warningsEnabled: scenario.warningsEnabled,
      warningKeys: [...scenario.warningKeys],
    },
    steps: scenarioStepsToConfigSteps(scenario),
    createdAt: now,
    updatedAt: now,
  }
}

export function getBuiltinScenarioConfig(scenarioId: string): ScenarioConfigDocument | undefined {
  const scenario = mockScenarios.find((s) => s.id === scenarioId)
  if (!scenario) return undefined
  return builtinScenarioToConfig(scenario)
}

export function listBuiltinScenarioIds(): string[] {
  return mockScenarios.map((s) => s.id)
}

export function isBuiltinScenarioId(scenarioId: string): boolean {
  return mockScenarios.some((s) => s.id === scenarioId)
}
