import {
  DEFAULT_SCENARIO_CONFIG_ACTIONS,
  allowedStepIdsForSimulator,
  defaultScreenIdForStep,
} from '../../config/scenarioAuthoring'
import type { SimulatorType } from '../../types/scenario'
import type { ScenarioConfigStep } from '../../types/scenarioConfig'

export function createDefaultStep(
  simulatorType: SimulatorType,
  usedStepIds: string[],
  titleSuffix = '',
): ScenarioConfigStep | null {
  const stepId =
    allowedStepIdsForSimulator(simulatorType).find((id) => !usedStepIds.includes(id)) ?? null
  if (!stepId) return null

  const linearNext = ''
  return {
    stepId,
    screenId: defaultScreenIdForStep(stepId, simulatorType),
    title: titleSuffix ? `${stepId} ${titleSuffix}` : stepId,
    bodyRef: '',
    actions: DEFAULT_SCENARIO_CONFIG_ACTIONS.map((action) => ({ ...action })),
    nextByAction: Object.fromEntries(
      DEFAULT_SCENARIO_CONFIG_ACTIONS.map((action) => [action.actionId, linearNext]),
    ),
  }
}

export function insertStepAt(
  steps: ScenarioConfigStep[],
  index: number,
  newStep: ScenarioConfigStep,
): ScenarioConfigStep[] {
  const next = [...steps]
  next.splice(index, 0, newStep)
  return next
}

export function duplicateStepAt(
  steps: ScenarioConfigStep[],
  index: number,
  simulatorType: SimulatorType,
): { steps: ScenarioConfigStep[]; error: 'all_steps_used' | null } {
  const used = steps.map((s) => s.stepId)
  const newStep = createDefaultStep(simulatorType, used)
  if (!newStep) return { steps, error: 'all_steps_used' }

  const source = steps[index]
  return {
    steps: insertStepAt(steps, index + 1, {
      ...structuredClone(source),
      stepId: newStep.stepId,
      screenId: newStep.screenId,
      title: source.title || newStep.title,
      nextByAction: { ...source.nextByAction },
    }),
    error: null,
  }
}

export function removeStepAt(
  steps: ScenarioConfigStep[],
  index: number,
): ScenarioConfigStep[] {
  const removed = steps[index]
  if (!removed) return steps

  return steps
    .filter((_, i) => i !== index)
    .map((step) => {
      const nextByAction = { ...step.nextByAction }
      for (const [actionId, target] of Object.entries(nextByAction)) {
        if (target === removed.stepId) nextByAction[actionId] = ''
      }
      return { ...step, nextByAction }
    })
}

export function reorderStep(
  steps: ScenarioConfigStep[],
  fromIndex: number,
  toIndex: number,
): ScenarioConfigStep[] {
  if (fromIndex < 0 || fromIndex >= steps.length || toIndex < 0 || toIndex >= steps.length) {
    return steps
  }
  const next = [...steps]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function linearNextStepId(
  steps: ScenarioConfigStep[],
  index: number,
): string {
  return steps[index + 1]?.stepId ?? ''
}

export function applyLinearNextForAction(
  step: ScenarioConfigStep,
  actionId: string,
  steps: ScenarioConfigStep[],
  stepIndex: number,
): ScenarioConfigStep {
  return {
    ...step,
    nextByAction: {
      ...step.nextByAction,
      [actionId]: linearNextStepId(steps, stepIndex),
    },
  }
}

export function clearBranchForAction(step: ScenarioConfigStep, actionId: string): ScenarioConfigStep {
  return {
    ...step,
    nextByAction: {
      ...step.nextByAction,
      [actionId]: '',
    },
  }
}

export function renameStepIdInSteps(
  steps: ScenarioConfigStep[],
  stepIndex: number,
  newStepId: string,
  simulatorType: SimulatorType,
): ScenarioConfigStep[] {
  const oldStepId = steps[stepIndex]?.stepId
  if (!oldStepId) return steps

  return steps.map((step, index) => {
    const nextByAction = { ...step.nextByAction }
    for (const [actionId, target] of Object.entries(nextByAction)) {
      if (target === oldStepId) nextByAction[actionId] = newStepId
    }

    if (index !== stepIndex) {
      return { ...step, nextByAction }
    }

    return {
      ...step,
      stepId: newStepId,
      screenId: defaultScreenIdForStep(newStepId, simulatorType),
      nextByAction,
    }
  })
}

export function issuesForStepPath(
  issues: Array<{ path: string }>,
  stepIndex: number,
): Array<{ path: string }> {
  const prefix = `steps[${stepIndex}]`
  return issues.filter((issue) => issue.path === prefix || issue.path.startsWith(`${prefix}.`))
}
