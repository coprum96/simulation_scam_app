import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import { authoredConfigToRuntimeScenario } from '../scenarioConfigToRuntime'
import type { ScenarioConfigDocument } from '../../../types/scenarioConfig'
import { ScenarioConfigFlowPreview } from './ScenarioConfigFlowPreview'

type ScenarioConfigPreviewProps = {
  document: ScenarioConfigDocument
}

export function ScenarioConfigPreview({ document }: ScenarioConfigPreviewProps) {
  const runtime = authoredConfigToRuntimeScenario(document)
  return (
    <div className="space-y-4">
      <ScenarioConfigFlowPreview document={document} />

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">{ru.authoring.previewSummaryTitle}</h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">{ru.authoring.fieldScenarioId}</dt>
            <dd className="font-medium text-slate-900">{document.scenarioId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{ru.authoring.fieldVersion}</dt>
            <dd className="font-medium text-slate-900">
              v{document.version} · {ru.authoring.statusLabels[document.status]}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{ru.authoring.fieldTitle}</dt>
            <dd className="font-medium text-slate-900">{document.metadata.title}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{ru.authoring.fieldSimulatorType}</dt>
            <dd className="font-medium text-slate-900">{document.metadata.simulatorType}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">{ru.authoring.runtimeStepsLabel}</dt>
            <dd className="font-mono text-xs text-slate-800">{runtime.steps.join(' → ')}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">{ru.authoring.previewJsonTitle}</h3>
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">
          {JSON.stringify(document, null, 2)}
        </pre>
      </Card>
    </div>
  )
}
