import {
  AUTHORING_ACTION_KINDS,
  allowedScreenIdsForSimulator,
  allowedStepIdsForSimulator,
  defaultScreenIdForStep,
} from '../../../config/scenarioAuthoring'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import type { ScenarioConfigDocument, ScenarioConfigStep, ScenarioConfigValidationIssue } from '../../../types/scenarioConfig'
import {
  applyLinearNextForAction,
  clearBranchForAction,
  createDefaultStep,
  duplicateStepAt,
  insertStepAt,
  issuesForStepPath,
  linearNextStepId,
  removeStepAt,
  reorderStep,
  renameStepIdInSteps,
} from '../stepEditorUtils'
import { AuthoringSelect, AuthoringTextField } from './AuthoringFormField'

type ScenarioConfigStepsEditorProps = {
  document: ScenarioConfigDocument
  onChange: (document: ScenarioConfigDocument) => void
  blocking: ScenarioConfigValidationIssue[]
  warnings: ScenarioConfigValidationIssue[]
}

function updateStep(
  steps: ScenarioConfigStep[],
  index: number,
  patch: Partial<ScenarioConfigStep>,
): ScenarioConfigStep[] {
  return steps.map((step, i) => (i === index ? { ...step, ...patch } : step))
}

function InlineStepIssues({ issues }: { issues: ScenarioConfigValidationIssue[] }) {
  if (issues.length === 0) return null
  return (
    <ul className="mb-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
      {issues.map((issue) => (
        <li key={`${issue.path}-${issue.messageKey}`}>
          {ru.authoring.validationMessages[issue.messageKey]}
        </li>
      ))}
    </ul>
  )
}

export function ScenarioConfigStepsEditor({
  document,
  onChange,
  blocking,
  warnings,
}: ScenarioConfigStepsEditorProps) {
  const { simulatorType } = document.metadata
  const stepIdOptions = allowedStepIdsForSimulator(simulatorType)
  const allowedScreens = allowedScreenIdsForSimulator(simulatorType)
  const knownStepIds = document.steps.map((s) => s.stepId)
  const allIssues = [...blocking, ...warnings]

  const setSteps = (steps: ScenarioConfigStep[]) => {
    onChange({ ...document, steps })
  }

  const appendStep = () => {
    const step = createDefaultStep(simulatorType, knownStepIds)
    if (!step) {
      window.alert(ru.authoring.validationMessages.allStepsUsedCannotDuplicate)
      return
    }
    setSteps([...document.steps, step])
  }

  const insertAdjacent = (index: number, position: 'before' | 'after') => {
    const step = createDefaultStep(simulatorType, knownStepIds)
    if (!step) {
      window.alert(ru.authoring.validationMessages.allStepsUsedCannotDuplicate)
      return
    }
    const at = position === 'before' ? index : index + 1
    setSteps(insertStepAt(document.steps, at, step))
  }

  const handleDuplicate = (index: number) => {
    const result = duplicateStepAt(document.steps, index, simulatorType)
    if (result.error === 'all_steps_used') {
      window.alert(ru.authoring.validationMessages.allStepsUsedCannotDuplicate)
      return
    }
    const copySuffix = ru.authoring.stepCopySuffix
    const sourceTitle = document.steps[index].title || document.steps[index].stepId
    const steps = result.steps.map((step, i) =>
      i === index + 1
        ? { ...step, title: `${sourceTitle} ${copySuffix}`.trim() }
        : step,
    )
    setSteps(steps)
  }

  const handleRemove = (index: number) => {
    if (document.steps.length <= 1) {
      window.alert(ru.authoring.deleteStepBlocked)
      return
    }
    const step = document.steps[index]
    if (!window.confirm(ru.authoring.deleteStepConfirm.replace('{stepId}', step.stepId))) {
      return
    }
    setSteps(removeStepAt(document.steps, index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{ru.authoring.stepsTitle}</h3>
        <Button type="button" variant="secondary" onClick={appendStep}>
          {ru.authoring.addStep}
        </Button>
      </div>
      <p className="text-xs text-slate-500">{ru.authoring.stepsEditorHint}</p>

      {document.steps.map((step, index) => {
        const stepIssues = issuesForStepPath(allIssues, index) as ScenarioConfigValidationIssue[]
        const recommendedScreen = defaultScreenIdForStep(step.stepId, simulatorType)
        const screenOk = allowedScreens.includes(step.screenId)
        const linearNext = linearNextStepId(document.steps, index)

        return (
          <Card key={`${step.stepId}-${index}`} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">
                {ru.authoring.stepLabel} {index + 1}: {step.stepId}
              </p>
              <div className="flex flex-wrap gap-1">
                <Button type="button" variant="ghost" onClick={() => insertAdjacent(index, 'before')}>
                  {ru.authoring.insertStepBefore}
                </Button>
                <Button type="button" variant="ghost" onClick={() => insertAdjacent(index, 'after')}>
                  {ru.authoring.insertStepAfter}
                </Button>
                <Button type="button" variant="ghost" onClick={() => handleDuplicate(index)}>
                  {ru.authoring.duplicateStep}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => setSteps(reorderStep(document.steps, index, index - 1))}
                >
                  {ru.authoring.moveStepUp}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={index >= document.steps.length - 1}
                  onClick={() => setSteps(reorderStep(document.steps, index, index + 1))}
                >
                  {ru.authoring.moveStepDown}
                </Button>
                <Button type="button" variant="ghost" onClick={() => handleRemove(index)}>
                  {ru.authoring.removeStep}
                </Button>
              </div>
            </div>

            <InlineStepIssues issues={stepIssues} />

            <p className="text-xs text-slate-500">
              {ru.authoring.screenCompatibilityHint.replace('{screenId}', recommendedScreen)}
              {!screenOk ? ` · ${ru.authoring.screenInvalidHint}` : null}
              {step.screenId !== recommendedScreen && screenOk
                ? ` · ${ru.authoring.screenMismatchHint}`
                : null}
            </p>

            <div className="grid gap-0 sm:grid-cols-2">
              <AuthoringSelect
                label={ru.authoring.fieldStepId}
                value={step.stepId}
                onChange={(e) => {
                  const stepId = e.target.value
                  setSteps(renameStepIdInSteps(document.steps, index, stepId, simulatorType))
                }}
              >
                {stepIdOptions.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </AuthoringSelect>
              <AuthoringSelect
                label={ru.authoring.fieldScreenId}
                value={step.screenId}
                onChange={(e) =>
                  setSteps(updateStep(document.steps, index, { screenId: e.target.value }))
                }
              >
                {allowedScreens.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </AuthoringSelect>
            </div>

            <AuthoringTextField
              label={ru.authoring.fieldStepTitle}
              value={step.title}
              onChange={(e) => setSteps(updateStep(document.steps, index, { title: e.target.value }))}
            />
            <AuthoringTextField
              label={ru.authoring.fieldBodyRef}
              value={step.bodyRef}
              hint={ru.authoring.bodyRefHint}
              onChange={(e) => setSteps(updateStep(document.steps, index, { bodyRef: e.target.value }))}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{ru.authoring.actionsTitle}</p>
              <p className="mb-2 text-xs text-slate-500">{ru.authoring.branchHelperHint}</p>
              {step.actions.map((action, actionIndex) => {
                const branchTarget = step.nextByAction[action.actionId]?.trim() ?? ''
                const usesBranch = branchTarget !== ''

                return (
                  <div
                    key={`${action.actionId}-${actionIndex}`}
                    className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="grid gap-0 sm:grid-cols-3">
                      <AuthoringTextField
                        label={ru.authoring.fieldActionId}
                        value={action.actionId}
                        onChange={(e) => {
                          const newActionId = e.target.value
                          const actions = step.actions.map((a, i) =>
                            i === actionIndex ? { ...a, actionId: newActionId } : a,
                          )
                          const nextByAction = { ...step.nextByAction }
                          if (step.nextByAction[action.actionId] !== undefined) {
                            nextByAction[newActionId] = step.nextByAction[action.actionId]
                            delete nextByAction[action.actionId]
                          }
                          setSteps(updateStep(document.steps, index, { actions, nextByAction }))
                        }}
                      />
                      <AuthoringTextField
                        label={ru.authoring.fieldLabelRef}
                        value={action.labelRef}
                        onChange={(e) => {
                          const actions = step.actions.map((a, i) =>
                            i === actionIndex ? { ...a, labelRef: e.target.value } : a,
                          )
                          setSteps(updateStep(document.steps, index, { actions }))
                        }}
                      />
                      <AuthoringSelect
                        label={ru.authoring.fieldActionKind}
                        value={action.kind}
                        onChange={(e) => {
                          const actions = step.actions.map((a, i) =>
                            i === actionIndex
                              ? {
                                  ...a,
                                  kind: e.target.value as (typeof AUTHORING_ACTION_KINDS)[number],
                                }
                              : a,
                          )
                          setSteps(updateStep(document.steps, index, { actions }))
                        }}
                      >
                        {AUTHORING_ACTION_KINDS.map((kind) => (
                          <option key={kind} value={kind}>
                            {kind}
                          </option>
                        ))}
                      </AuthoringSelect>
                    </div>

                    <p className="mb-2 mt-1 text-xs text-slate-500">
                      {usesBranch
                        ? ru.authoring.branchActiveHint.replace('{target}', branchTarget)
                        : ru.authoring.branchLinearHint.replace(
                            '{target}',
                            linearNext || ru.authoring.flowEndLabel,
                          )}
                    </p>

                    <div className="mb-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setSteps(
                            updateStep(
                              document.steps,
                              index,
                              clearBranchForAction(step, action.actionId),
                            ),
                          )
                        }
                      >
                        {ru.authoring.useLinearNext}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setSteps(
                            updateStep(
                              document.steps,
                              index,
                              applyLinearNextForAction(step, action.actionId, document.steps, index),
                            ),
                          )
                        }
                      >
                        {ru.authoring.setLinearTarget}
                      </Button>
                    </div>

                    <AuthoringSelect
                      label={ru.authoring.fieldNextStep}
                      value={branchTarget}
                      onChange={(e) => {
                        const nextByAction = {
                          ...step.nextByAction,
                          [action.actionId]: e.target.value,
                        }
                        setSteps(updateStep(document.steps, index, { nextByAction }))
                      }}
                    >
                      <option value="">{ru.authoring.nextStepLinear}</option>
                      {knownStepIds.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </AuthoringSelect>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const newActionId = `action_${step.actions.length + 1}`
                  const actions = [
                    ...step.actions,
                    { actionId: newActionId, labelRef: 'buttons.continue', kind: 'secondary' as const },
                  ]
                  const nextByAction = { ...step.nextByAction, [newActionId]: '' }
                  setSteps(updateStep(document.steps, index, { actions, nextByAction }))
                }}
              >
                {ru.authoring.addAction}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
