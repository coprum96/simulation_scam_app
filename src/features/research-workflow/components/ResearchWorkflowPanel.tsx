import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import type { WorkflowStepId } from '../types'
import { useResearchWorkflowProgress } from '../useResearchWorkflowProgress'
import { dismissWorkflowIntro, isWorkflowIntroDismissed } from '../workflowStorage'
import { notifyWorkflowChange } from '../useInvestigationMarkers'

type ResearchWorkflowPanelProps = {
  pageStep: WorkflowStepId
  hasAnySessions: boolean
  compact?: boolean
}

const stepLabels: Record<WorkflowStepId, string> = {
  simulate: ru.researcher.workflow.steps.simulate,
  analytics: ru.researcher.workflow.steps.analytics,
  investigate: ru.researcher.workflow.steps.investigate,
  conclude: ru.researcher.workflow.steps.conclude,
}

export function ResearchWorkflowPanel({
  pageStep,
  hasAnySessions,
  compact = false,
}: ResearchWorkflowPanelProps) {
  const { steps, introDismissed } = useResearchWorkflowProgress(hasAnySessions, pageStep)

  if (introDismissed && compact) return null

  return (
    <Card className="mb-5 border-teal-100 bg-teal-50/30 p-4 sm:mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {ru.researcher.workflow.pathTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
            {ru.researcher.workflow.pathDescription}
          </p>
        </div>
        {!introDismissed ? (
          <Button
            type="button"
            variant="ghost"
            className="!min-h-8 shrink-0 text-xs"
            onClick={() => {
              dismissWorkflowIntro()
              notifyWorkflowChange()
            }}
          >
            {ru.researcher.workflow.dismissIntro}
          </Button>
        ) : null}
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const tone = step.current
            ? 'border-teal-600 bg-white ring-1 ring-teal-600/20'
            : step.done
              ? 'border-slate-200 bg-white/80'
              : 'border-slate-200/80 bg-white/50'

          return (
            <li
              key={step.id}
              className={`rounded-xl border px-3 py-2.5 ${tone}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.done
                      ? 'bg-teal-700 text-white'
                      : step.current
                        ? 'bg-teal-100 text-teal-900'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.done ? '✓' : index + 1}
                </span>
                <span className="text-xs font-medium text-slate-900">{stepLabels[step.id]}</span>
              </div>
            </li>
          )
        })}
      </ol>

      {!hasAnySessions && pageStep === 'simulate' ? (
        <p className="mt-3 text-xs text-slate-600">{ru.researcher.workflow.startHint}</p>
      ) : null}
    </Card>
  )
}

export function shouldShowExpandedWorkflow(): boolean {
  return !isWorkflowIntroDismissed()
}
