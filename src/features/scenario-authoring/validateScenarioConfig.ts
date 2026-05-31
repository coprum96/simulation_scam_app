import { SCENARIO_ID_PATTERN, allowedScreenIdsForSimulator, allowedStepIdsForSimulator } from '../../config/scenarioAuthoring'
import { isBuiltinScenarioId, listBuiltinScenarioIds } from './builtinScenarioToConfig'
import type {
  ScenarioConfigDocument,
  ScenarioConfigExportBundle,
  ScenarioConfigValidationIssue,
  ScenarioConfigValidationMessageKey,
} from '../../types/scenarioConfig'
import { SCENARIO_CONFIG_SCHEMA_VERSION } from '../../types/scenarioConfig'

export type ScenarioConfigValidationResult = {
  valid: boolean
  issues: ScenarioConfigValidationIssue[]
}

function blockingIssue(
  path: string,
  messageKey: ScenarioConfigValidationMessageKey,
): ScenarioConfigValidationIssue {
  return { path, messageKey, severity: 'blocking' }
}

export function validateScenarioConfig(
  doc: ScenarioConfigDocument,
  options?: { existingScenarioIds?: string[]; allowBuiltinId?: boolean },
): ScenarioConfigValidationResult {
  const issues: ScenarioConfigValidationIssue[] = []
  const existing = new Set(options?.existingScenarioIds ?? [])

  if (!doc.scenarioId.trim()) {
    issues.push(blockingIssue('scenarioId', 'scenarioIdRequired'))
  } else if (!SCENARIO_ID_PATTERN.test(doc.scenarioId)) {
    issues.push(blockingIssue('scenarioId', 'scenarioIdFormat'))
  } else if (!options?.allowBuiltinId && isBuiltinScenarioId(doc.scenarioId)) {
    issues.push(blockingIssue('scenarioId', 'scenarioIdBuiltinConflict'))
  } else if (existing.has(doc.scenarioId)) {
    issues.push(blockingIssue('scenarioId', 'scenarioIdDuplicate'))
  }

  if (!doc.metadata.title.trim()) issues.push(blockingIssue('metadata.title', 'titleRequired'))
  if (!doc.metadata.description.trim()) issues.push(blockingIssue('metadata.description', 'descriptionRequired'))
  if (doc.metadata.expectedRiskFlags.length === 0) {
    issues.push(blockingIssue('metadata.expectedRiskFlags', 'expectedFlagsRequired'))
  }
  if (doc.metadata.targetProfileIds.length === 0) {
    issues.push(blockingIssue('metadata.targetProfileIds', 'profilesRequired'))
  }
  if (!Number.isInteger(doc.version) || doc.version < 1) {
    issues.push(blockingIssue('version', 'versionInvalid'))
  }

  if (doc.steps.length === 0) {
    issues.push(blockingIssue('steps', 'stepsRequired'))
  }

  const stepIds = new Set<string>()
  const allowedSteps = new Set(allowedStepIdsForSimulator(doc.metadata.simulatorType))
  const allowedScreens = new Set(allowedScreenIdsForSimulator(doc.metadata.simulatorType))

  for (const [index, step] of doc.steps.entries()) {
    const base = `steps[${index}]`
    if (!step.stepId.trim()) {
      issues.push(blockingIssue(`${base}.stepId`, 'stepIdInvalid'))
    } else if (stepIds.has(step.stepId)) {
      issues.push(blockingIssue(`${base}.stepId`, 'stepIdDuplicate'))
    } else {
      stepIds.add(step.stepId)
      if (!allowedSteps.has(step.stepId)) {
        issues.push(blockingIssue(`${base}.stepId`, 'stepIdInvalid'))
      }
    }

    if (!allowedScreens.has(step.screenId)) {
      issues.push(blockingIssue(`${base}.screenId`, 'screenIdInvalid'))
    }

    const actionIds = new Set<string>()
    for (const [actionIndex, action] of step.actions.entries()) {
      const actionPath = `${base}.actions[${actionIndex}]`
      if (!action.actionId.trim()) {
        issues.push(blockingIssue(`${actionPath}.actionId`, 'actionIdRequired'))
      } else if (actionIds.has(action.actionId)) {
        issues.push(blockingIssue(`${actionPath}.actionId`, 'actionIdDuplicate'))
      } else {
        actionIds.add(action.actionId)
      }

      const next = step.nextByAction[action.actionId]
      if (next && next !== '' && !stepIds.has(next) && !doc.steps.some((s) => s.stepId === next)) {
        issues.push(blockingIssue(`${base}.nextByAction.${action.actionId}`, 'nextStepInvalid'))
      }
    }
  }

  for (const [index, step] of doc.steps.entries()) {
    for (const [actionId, next] of Object.entries(step.nextByAction)) {
      if (!next || next === '') continue
      if (!stepIds.has(next)) {
        issues.push(blockingIssue(`steps[${index}].nextByAction.${actionId}`, 'nextStepInvalid'))
      }
    }
  }

  return { valid: issues.length === 0, issues }
}

export function validateScenarioConfigForSave(
  doc: ScenarioConfigDocument,
  knownScenarioIds: string[],
): ScenarioConfigValidationResult {
  const otherFamilyIds = knownScenarioIds.filter((id) => id !== doc.scenarioId)
  return validateScenarioConfig(doc, { existingScenarioIds: otherFamilyIds })
}

export function parseScenarioConfigExportBundle(raw: unknown): ScenarioConfigExportBundle | null {
  if (!raw || typeof raw !== 'object') return null
  const bundle = raw as ScenarioConfigExportBundle
  if (bundle.exportSchema !== 'scenario_config_bundle') return null
  if (!Array.isArray(bundle.documents)) return null
  return bundle
}

export function validateImportDocuments(
  documents: ScenarioConfigDocument[],
): ScenarioConfigValidationResult {
  const issues: ScenarioConfigValidationIssue[] = []
  const builtinIds = new Set(listBuiltinScenarioIds())

  for (const [index, doc] of documents.entries()) {
    if (doc.schemaVersion !== SCENARIO_CONFIG_SCHEMA_VERSION) {
      issues.push(blockingIssue(`documents[${index}].schemaVersion`, 'versionInvalid'))
    }
    const result = validateScenarioConfig(doc, {
      allowBuiltinId: false,
      existingScenarioIds: documents
        .filter((_, i) => i !== index)
        .map((d) => d.scenarioId),
    })
    for (const item of result.issues) {
      issues.push({
        ...item,
        path: `documents[${index}].${item.path}`,
        severity: 'blocking',
      })
    }
    if (builtinIds.has(doc.scenarioId)) {
      issues.push(blockingIssue(`documents[${index}].scenarioId`, 'scenarioIdBuiltinConflict'))
    }
  }

  return { valid: issues.length === 0, issues }
}
