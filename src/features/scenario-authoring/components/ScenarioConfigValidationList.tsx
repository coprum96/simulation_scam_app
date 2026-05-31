import { ru } from '../../../content/ru'
import type { ScenarioConfigValidationIssue } from '../../../types/scenarioConfig'

type ScenarioConfigValidationListProps = {
  blocking: ScenarioConfigValidationIssue[]
  warnings: ScenarioConfigValidationIssue[]
  publishMode?: boolean
}

function IssueList({
  title,
  issues,
  tone,
}: {
  title: string
  issues: ScenarioConfigValidationIssue[]
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
        {issues.map((issue) => (
          <li key={`${issue.path}-${issue.messageKey}-${issue.severity}`}>
            <span className="font-mono text-xs">{issue.path}</span>:{' '}
            {ru.authoring.validationMessages[issue.messageKey]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScenarioConfigValidationList({
  blocking,
  warnings,
  publishMode = false,
}: ScenarioConfigValidationListProps) {
  if (blocking.length === 0 && warnings.length === 0) {
    if (!publishMode) return null
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        {ru.authoring.publishReady}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {publishMode && blocking.length === 0 && warnings.length > 0 ? (
        <p className="text-sm text-slate-600">{ru.authoring.publishWarningsHint}</p>
      ) : null}
      <IssueList title={ru.authoring.validationBlockingTitle} issues={blocking} tone="blocking" />
      <IssueList title={ru.authoring.validationWarningsTitle} issues={warnings} tone="warning" />
    </div>
  )
}
