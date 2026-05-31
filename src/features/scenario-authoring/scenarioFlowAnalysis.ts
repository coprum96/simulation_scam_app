import { defaultScreenIdForStep } from '../../config/scenarioAuthoring'
import type {
  ScenarioConfigDocument,
  ScenarioConfigValidationIssue,
  ScenarioConfigValidationMessageKey,
  ScenarioConfigValidationSeverity,
} from '../../types/scenarioConfig'
import { linearNextStepId } from './stepEditorUtils'

export type FlowTransitionPreview = {
  fromIndex: number
  fromStepId: string
  actionId: string
  actionLabelRef: string
  toStepId: string
  mode: 'linear' | 'branch'
  isBroken: boolean
}

export type ScenarioFlowPreview = {
  linearRuntimePath: string[]
  transitions: FlowTransitionPreview[]
  unreachableStepIds: string[]
}

function computeReachableStepIds(steps: ScenarioConfigDocument['steps']): Set<string> {
  const reachable = new Set<string>()
  if (steps.length === 0) return reachable

  const queue = [steps[0].stepId]
  while (queue.length > 0) {
    const id = queue.shift()
    if (!id || reachable.has(id)) continue
    reachable.add(id)

    const index = steps.findIndex((s) => s.stepId === id)
    if (index < 0) continue

    const linearTarget = linearNextStepId(steps, index)
    if (linearTarget) queue.push(linearTarget)

    const step = steps[index]
    for (const action of step.actions) {
      const branchTarget = step.nextByAction[action.actionId]?.trim()
      if (branchTarget) queue.push(branchTarget)
    }
  }

  return reachable
}

function flowIssue(
  path: string,
  messageKey: ScenarioConfigValidationMessageKey,
  severity: ScenarioConfigValidationSeverity,
): ScenarioConfigValidationIssue {
  return { path, messageKey, severity }
}

export function buildScenarioFlowPreview(document: ScenarioConfigDocument): ScenarioFlowPreview {
  const { steps } = document
  const knownStepIds = new Set(steps.map((s) => s.stepId))
  const linearRuntimePath = steps.map((s) => s.stepId)
  const transitions: FlowTransitionPreview[] = []

  for (const [index, step] of steps.entries()) {
    const linearTarget = linearNextStepId(steps, index)
    for (const action of step.actions) {
      const branchTarget = step.nextByAction[action.actionId]?.trim() ?? ''
      const usesBranch = branchTarget !== ''
      const toStepId = usesBranch ? branchTarget : linearTarget
      const isBroken = Boolean(toStepId && toStepId !== '—' && !knownStepIds.has(toStepId))
      transitions.push({
        fromIndex: index,
        fromStepId: step.stepId,
        actionId: action.actionId,
        actionLabelRef: action.labelRef,
        toStepId: toStepId || '—',
        mode: usesBranch ? 'branch' : 'linear',
        isBroken,
      })
    }
  }

  const reachable = computeReachableStepIds(steps)
  const unreachableStepIds = steps
    .map((s) => s.stepId)
    .filter((id) => !reachable.has(id))

  return { linearRuntimePath, transitions, unreachableStepIds }
}

export function analyzeScenarioGuidance(
  document: ScenarioConfigDocument,
): ScenarioConfigValidationIssue[] {
  const warnings: ScenarioConfigValidationIssue[] = []
  const { steps, metadata } = document
  const flow = buildScenarioFlowPreview(document)

  if (steps.length > 0 && !flow.linearRuntimePath.includes('result')) {
    warnings.push(flowIssue('steps', 'noResultStep', 'warning'))
  }

  for (const stepId of flow.unreachableStepIds) {
    const index = steps.findIndex((s) => s.stepId === stepId)
    warnings.push(
      flowIssue(`steps[${index}]`, 'unreachableStep', 'warning'),
    )
  }

  if (metadata.warningsEnabled && !steps.some((s) => s.stepId === 'warning')) {
    warnings.push(flowIssue('metadata.warningsEnabled', 'warningsEnabledNoWarningStep', 'warning'))
  }

  for (const [index, step] of steps.entries()) {
    if (!step.bodyRef.trim()) {
      warnings.push(flowIssue(`steps[${index}].bodyRef`, 'emptyBodyRef', 'warning'))
    }

    const recommended = defaultScreenIdForStep(step.stepId, metadata.simulatorType)
    if (step.screenId !== recommended) {
      warnings.push(flowIssue(`steps[${index}].screenId`, 'screenIdMismatchHint', 'warning'))
    }

    const linearTarget = linearNextStepId(steps, index)
    for (const action of step.actions) {
      const branchTarget = step.nextByAction[action.actionId]?.trim() ?? ''
      if (branchTarget && branchTarget !== linearTarget && branchTarget !== '') {
        warnings.push(
          flowIssue(
            `steps[${index}].nextByAction.${action.actionId}`,
            'branchOverridesLinear',
            'warning',
          ),
        )
      }
    }
  }

  return warnings
}
