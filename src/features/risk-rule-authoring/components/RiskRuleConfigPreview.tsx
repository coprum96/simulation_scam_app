import { ru } from '../../../content/ru'
import type { RiskRuleConfigDocument } from '../../../types/riskRuleConfig'
import { buildRiskRulePreview } from '../riskRulePreview'
import { Card } from '../../../components/ui/Card'

type Props = {
  document: RiskRuleConfigDocument
}

export function RiskRuleConfigPreview({ document }: Props) {
  const preview = buildRiskRulePreview(document)

  return (
    <Card className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        {ru.riskRuleAuthoring.previewSummaryTitle}
      </h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">{ru.riskRuleAuthoring.previewScoreLabel}</dt>
          <dd className="font-mono text-lg font-semibold text-slate-900">
            {!document.enabled ? (
              ru.riskRuleAuthoring.previewScoreDisabled
            ) : (
              <>
                {preview.scoreContribution > 0 ? '+' : ''}
                {preview.scoreContribution}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{ru.riskRuleAuthoring.previewRuntimeRuleIdLabel}</dt>
          <dd className="font-mono text-xs text-slate-800">{preview.runtimeRuleId}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{ru.riskRuleAuthoring.previewLevelHintLabel}</dt>
          <dd className="text-slate-800">{preview.levelHintLabel}</dd>
        </div>
      </dl>
      <div>
        <p className="mb-1 text-xs text-slate-500">{ru.riskRuleAuthoring.previewFlagsLabel}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
          {preview.emittedFlagsLabels.length > 0 ? (
            preview.emittedFlagsLabels.map((label) => <li key={label}>{label}</li>)
          ) : (
            <li className="list-none pl-0 text-slate-500">{ru.risk.noFlags}</li>
          )}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-xs text-slate-500">{ru.riskRuleAuthoring.previewLogicLabel}</p>
        <p className="text-sm leading-relaxed text-slate-800">{preview.logicSummary}</p>
      </div>
    </Card>
  )
}
