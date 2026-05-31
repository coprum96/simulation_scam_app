import { DEFAULT_PROFILE_ID } from '../../config'
import {
  DEFAULT_SCENARIO_CONFIG_ACTIONS,
  defaultScreenIdForStep,
} from '../../config/scenarioAuthoring'
import type { SimulatorType } from '../../types/scenario'
import type { ScenarioConfigDocument } from '../../types/scenarioConfig'
import { SCENARIO_CONFIG_SCHEMA_VERSION } from '../../types/scenarioConfig'

const BANKING_TEMPLATE_STEPS = ['home', 'transfer', 'review', 'result'] as const
const WALLET_TEMPLATE_STEPS = ['wallet_home', 'connect_service', 'result'] as const

function buildTemplateSteps(simulatorType: SimulatorType): ScenarioConfigDocument['steps'] {
  const stepIds = simulatorType === 'banking' ? BANKING_TEMPLATE_STEPS : WALLET_TEMPLATE_STEPS
  return stepIds.map((stepId, index) => {
    const nextStepId = stepIds[index + 1] ?? ''
    return {
      stepId,
      screenId: defaultScreenIdForStep(stepId, simulatorType),
      title: stepId,
      bodyRef: '',
      actions: DEFAULT_SCENARIO_CONFIG_ACTIONS.map((action) => ({ ...action })),
      nextByAction: { continue: nextStepId },
    }
  })
}

export function createDefaultScenarioConfig(
  scenarioId: string,
  simulatorType: SimulatorType,
): ScenarioConfigDocument {
  const now = new Date().toISOString()
  return {
    schemaVersion: SCENARIO_CONFIG_SCHEMA_VERSION,
    scenarioId,
    version: 1,
    status: 'draft',
    metadata: {
      title: scenarioId,
      description: '',
      simulatorType,
      riskLevel: 'medium',
      expectedRiskFlags: [],
      targetProfileIds: [DEFAULT_PROFILE_ID],
      warningsEnabled: false,
      warningKeys: [],
    },
    steps: buildTemplateSteps(simulatorType),
    createdAt: now,
    updatedAt: now,
  }
}
