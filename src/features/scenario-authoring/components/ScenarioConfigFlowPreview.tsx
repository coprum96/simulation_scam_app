import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import { buildScenarioFlowPreview } from '../scenarioFlowAnalysis'
import type { ScenarioConfigDocument } from '../../../types/scenarioConfig'

type ScenarioConfigFlowPreviewProps = {
  document: ScenarioConfigDocument
}

export function ScenarioConfigFlowPreview({ document }: ScenarioConfigFlowPreviewProps) {
  const flow = buildScenarioFlowPreview(document)

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {ru.authoring.flowPreviewTitle}
        </h3>
        <p className="mb-3 text-xs text-slate-500">{ru.authoring.flowPreviewHint}</p>
        <ol className="space-y-2">
          {flow.linearRuntimePath.map((stepId, index) => (
            <li
              key={`${stepId}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{stepId}</p>
                <p className="text-xs text-slate-500">
                  {ru.authoring.flowLinearOrderLabel}
                  {index < flow.linearRuntimePath.length - 1
                    ? ` → ${flow.linearRuntimePath[index + 1]}`
                    : ` · ${ru.authoring.flowEndLabel}`}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {ru.authoring.flowTransitionsTitle}
        </h3>
        {flow.transitions.length === 0 ? (
          <p className="text-sm text-slate-500">{ru.authoring.flowNoTransitions}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {flow.transitions.map((transition, index) => (
              <li
                key={`${transition.fromStepId}-${transition.actionId}-${index}`}
                className={`rounded-xl border px-3 py-2 ${
                  transition.isBroken
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="font-mono text-xs text-slate-600">{transition.fromStepId}</span>
                <span className="text-slate-400"> · </span>
                <span className="text-slate-700">{transition.actionId}</span>
                <span className="text-slate-400"> → </span>
                <span
                  className={`font-medium ${transition.isBroken ? 'text-red-800' : 'text-slate-900'}`}
                >
                  {transition.toStepId}
                </span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    transition.mode === 'branch'
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {transition.mode === 'branch'
                    ? ru.authoring.flowModeBranch
                    : ru.authoring.flowModeLinear}
                </span>
                {transition.isBroken ? (
                  <span className="ml-2 text-xs font-medium text-red-700">
                    {ru.authoring.flowBrokenTransition}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {flow.unreachableStepIds.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <h3 className="mb-2 text-sm font-semibold text-amber-950">
            {ru.authoring.flowUnreachableTitle}
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-950">
            {flow.unreachableStepIds.map((stepId) => (
              <li key={stepId}>{stepId}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
