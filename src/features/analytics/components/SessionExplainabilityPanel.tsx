import { Link } from 'react-router-dom'
import { sessionReplayPath, riskLevelLabel } from '../../../config'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { replayOutcomeLabel } from '../../session-replay/replayFormatters'
import type { SessionExplainability } from '../drilldownTypes'
import {
  analyticsFlagDrilldownPath,
  analyticsRuleDrilldownPath,
  analyticsScenarioDrilldownPath,
} from '../analyticsPaths'
import type { AnalyticsFilterState } from '../analyticsFilters'

type SessionExplainabilityPanelProps = {
  explain: SessionExplainability
  filters: AnalyticsFilterState
}

function whyHighRiskText(key: SessionExplainability['whyHighRiskKeys'][number], explain: SessionExplainability): string {
  const t = ru.analytics.explainWhyHighRisk
  switch (key) {
    case 'scoreAboveThreshold':
      return t.scoreAboveThreshold(explain.riskScore, explain.thresholdHighMin)
    case 'rulesContributed':
      return t.rulesContributed(explain.ruleImpacts.length, explain.totalRuleDelta)
    case 'flagsTriggered':
      return t.flagsTriggered(explain.triggeredFlags.length)
    case 'outcomeAbandoned':
      return t.outcomeAbandoned
    default:
      return ''
  }
}

export function SessionExplainabilityPanel({ explain, filters }: SessionExplainabilityPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-base font-semibold text-slate-900">{ru.analytics.explainTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{ru.analytics.explainDescription}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">{ru.dashboard.colRiskScore}</dt>
            <dd className="font-semibold text-slate-900">{explain.riskScore}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{ru.dashboard.colRiskLevel}</dt>
            <dd className="font-semibold text-slate-900">{riskLevelLabel(explain.riskLevel)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{ru.dashboard.colOutcome}</dt>
            <dd className="font-semibold text-slate-900">
              {explain.outcome ? replayOutcomeLabel(explain.outcome) : ru.replay.outcomeNone}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{ru.dashboard.colScenario}</dt>
            <dd>
              <Link
                to={analyticsScenarioDrilldownPath(explain.scenarioId, filters)}
                className="font-semibold text-teal-700 hover:text-teal-900"
              >
                {explain.scenarioId}
              </Link>
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={sessionReplayPath(explain.sessionId)}>
            <Button variant="secondary">{ru.dashboard.openReplay}</Button>
          </Link>
        </div>
      </Card>

      {explain.isHighRisk ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.explainWhyHighRiskTitle}</h3>
          {explain.whyHighRiskKeys.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{ru.analytics.explainNoHighRiskReasons}</p>
          ) : (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
              {explain.whyHighRiskKeys.map((key) => (
                <li key={key}>{whyHighRiskText(key, explain)}</li>
              ))}
            </ul>
          )}
        </Card>
      ) : (
        <Card className="p-4">
          <p className="text-sm text-slate-600">{ru.analytics.explainNotHighRisk}</p>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.explainFlagsTitle}</h3>
        </div>
        {explain.triggeredFlags.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-500">{ru.analytics.explainNoFlags}</p>
        ) : (
          <ul className="divide-y divide-slate-100 px-4 py-2">
            {explain.triggeredFlags.map((flagId) => (
              <li key={flagId} className="py-2">
                <Link
                  to={analyticsFlagDrilldownPath(flagId, filters)}
                  className="font-mono text-sm text-teal-700 hover:text-teal-900"
                >
                  {flagId}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.explainRulesTitle}</h3>
          <p className="mt-1 text-xs text-slate-500">{ru.analytics.explainRulesHint}</p>
        </div>
        {explain.ruleImpacts.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-500">{ru.analytics.explainNoRules}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-2 font-medium">{ru.analytics.colRuleId}</th>
                  <th className="px-4 py-2 font-medium">{ru.analytics.colAvgImpact}</th>
                  <th className="px-4 py-2 font-medium">{ru.analytics.explainRunningScore}</th>
                </tr>
              </thead>
              <tbody>
                {explain.ruleImpacts.map((row) => (
                  <tr key={row.ruleId} className="border-b border-slate-100">
                    <td className="px-4 py-2">
                      <Link
                        to={analyticsRuleDrilldownPath(row.ruleId, filters)}
                        className="font-mono text-teal-700 hover:text-teal-900"
                      >
                        {row.ruleId}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      {row.delta > 0 ? '+' : ''}
                      {row.delta}
                    </td>
                    <td className="px-4 py-2 font-medium">{row.runningScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
