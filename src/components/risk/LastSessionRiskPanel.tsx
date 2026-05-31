import { Link } from 'react-router-dom'
import type { RiskFlagId } from '../../types/risk'
import type { Session } from '../../types/contracts'
import { ru } from '../../content/ru'
import { riskLevelLabel, sessionReplayPath } from '../../config'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { analyticsDashboardPath, analyticsSessionExplainPath } from '../../features/analytics/analyticsPaths'
import { sessionRiskLevel } from '../../features/dashboard/dashboardFilters'

type LastSessionRiskPanelProps = {
  session: Session | null
}

const ruleCopy = ru.risk.rules

export function LastSessionRiskPanel({ session }: LastSessionRiskPanelProps) {
  if (!session || session.record.status !== 'ended') {
    return (
      <Card>
        <p className="text-sm text-slate-600">{ru.risk.noSession}</p>
      </Card>
    )
  }

  const { summary, record, riskReport } = session
  const assessment = riskReport?.assessment
  const score = record.riskScore ?? assessment?.riskScore ?? summary.riskScore
  const level = record.riskLevel ?? assessment?.riskLevel ?? summary.riskLevel
  const hits = assessment?.ruleHits ?? []
  const isHighRisk = sessionRiskLevel(session) === 'high'

  return (
    <Card>
      <p className="mb-3 font-medium text-slate-900">{ru.risk.panelTitle}</p>
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
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">{ru.risk.flagsLabel}</p>
          <ul className="space-y-2 text-sm text-slate-700">
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
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">{ru.risk.noFlags}</p>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <Link to={analyticsDashboardPath()}>
          <Button variant="secondary" className="w-full">
            {ru.researcher.workflow.ctaOpenAnalytics}
          </Button>
        </Link>
        <Link to={sessionReplayPath(record.sessionId)}>
          <Button variant="secondary" className="w-full">
            {ru.researcher.workflow.ctaOpenReplay}
          </Button>
        </Link>
        {isHighRisk ? (
          <Link to={analyticsSessionExplainPath(record.sessionId)}>
            <Button variant="secondary" className="w-full">
              {ru.researcher.workflow.ctaOpenExplain}
            </Button>
          </Link>
        ) : null}
      </div>
    </Card>
  )
}
