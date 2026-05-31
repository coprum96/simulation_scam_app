import type { RiskFlagId } from '../../../types/risk'
import type { Session } from '../../../types/contracts'
import { ru } from '../../../content/ru'
import { riskLevelLabel } from '../../../config'
import { Card } from '../../../components/ui/Card'

type ReplayRiskSummaryBlockProps = {
  session: Session
}

const ruleCopy = ru.risk.rules

export function ReplayRiskSummaryBlock({ session }: ReplayRiskSummaryBlockProps) {
  const { record, summary, riskReport } = session

  if (record.status !== 'ended') {
    return (
      <Card>
        <h2 className="mb-2 text-base font-semibold text-slate-900">{ru.replay.riskTitle}</h2>
        <p className="text-sm text-slate-600">{ru.replay.riskPending}</p>
      </Card>
    )
  }

  const score = record.riskScore ?? summary.riskScore
  const level = record.riskLevel ?? summary.riskLevel
  const hits = riskReport?.assessment?.ruleHits ?? []

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-slate-900">{ru.replay.riskTitle}</h2>
      <dl className="space-y-2 text-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <dt className="text-slate-500">{ru.risk.scoreLabel}</dt>
          <dd className="font-medium">{score}</dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <dt className="text-slate-500">{ru.risk.levelLabel}</dt>
          <dd className="font-medium">{riskLevelLabel(level)}</dd>
        </div>
      </dl>
      {hits.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {hits.map((hit) => {
            const id = hit.ruleId as RiskFlagId
            const rule = ruleCopy[id]
            return (
              <li key={id} className="rounded border border-slate-100 px-2 py-1.5">
                <p className="font-medium">
                  {rule?.label ?? id}
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {hit.delta > 0 ? '+' : ''}
                    {hit.delta}
                  </span>
                </p>
                {rule?.description ? (
                  <p className="text-xs text-slate-500">{rule.description}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-slate-500">{ru.risk.noFlags}</p>
      )}
    </Card>
  )
}
