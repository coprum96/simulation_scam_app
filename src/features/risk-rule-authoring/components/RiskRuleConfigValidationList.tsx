import { ru } from '../../../content/ru'
import type { RiskRuleConfigValidationIssue } from '../../../types/riskRuleConfig'

type Props = {
  blocking: RiskRuleConfigValidationIssue[]
  warnings: RiskRuleConfigValidationIssue[]
  publishMode?: boolean
}

function IssueList({
  title,
  issues,
  tone,
}: {
  title: string
  issues: RiskRuleConfigValidationIssue[]
  tone: 'blocking' | 'warning'
}) {
  if (issues.length === 0) return null
  const boxClass =
    tone === 'blocking'
      ? 'border-red-200 bg-red-50 text-red-950'
      : 'border-amber-200 bg-amber-50 text-amber-950'

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${boxClass}`}>
      <p className="mb-2 font-medium">{title}</p>
      <ul className="list-disc space-y-1 pl-5">
        {issues.map((issue, index) => (
          <li key={`${issue.key}-${issue.field ?? ''}-${index}`}>
            {issue.field ? (
              <span className="font-mono text-xs">{issue.field}</span>
            ) : null}
            {issue.field ? ': ' : null}
            {ru.riskRuleAuthoring.validationMessages[issue.key]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RiskRuleConfigValidationList({ blocking, warnings, publishMode = false }: Props) {
  if (blocking.length === 0 && warnings.length === 0) {
    if (!publishMode) return null
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        {ru.riskRuleAuthoring.publishReady}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {publishMode && blocking.length === 0 && warnings.length > 0 ? (
        <p className="text-sm text-slate-600">{ru.riskRuleAuthoring.publishWarningsHint}</p>
      ) : null}
      <IssueList
        title={ru.riskRuleAuthoring.validationBlockingTitle}
        issues={blocking}
        tone="blocking"
      />
      <IssueList
        title={ru.riskRuleAuthoring.validationWarningsTitle}
        issues={warnings}
        tone="warning"
      />
    </div>
  )
}
