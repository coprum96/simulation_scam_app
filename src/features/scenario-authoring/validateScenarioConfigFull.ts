import type {
  ScenarioConfigDocument,
  ScenarioConfigValidationIssue,
} from '../../types/scenarioConfig'
import { analyzeScenarioGuidance } from './scenarioFlowAnalysis'
import { validateScenarioConfig, validateScenarioConfigForSave } from './validateScenarioConfig'

export type ScenarioConfigFullValidation = {
  blocking: ScenarioConfigValidationIssue[]
  warnings: ScenarioConfigValidationIssue[]
  canSaveDraft: boolean
  canPublish: boolean
}

export function validateScenarioConfigFull(
  doc: ScenarioConfigDocument,
  knownScenarioIds: string[],
): ScenarioConfigFullValidation {
  const core = validateScenarioConfigForSave(doc, knownScenarioIds)
  const blocking = core.issues
  const warnings = analyzeScenarioGuidance(doc)

  return {
    blocking,
    warnings,
    canSaveDraft: blocking.length === 0,
    canPublish: blocking.length === 0,
  }
}

export function validateScenarioConfigFullCore(
  doc: ScenarioConfigDocument,
  options?: Parameters<typeof validateScenarioConfig>[1],
): ScenarioConfigFullValidation {
  const core = validateScenarioConfig(doc, options)
  const blocking = core.issues
  const warnings = analyzeScenarioGuidance(doc)
  return {
    blocking,
    warnings,
    canSaveDraft: blocking.length === 0,
    canPublish: blocking.length === 0,
  }
}
