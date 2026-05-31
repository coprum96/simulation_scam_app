import { Link } from 'react-router-dom'
import { sessionReplayPath } from '../../../config'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { riskLevelLabel } from '../../../config'
import { replayOutcomeLabel } from '../../session-replay/replayFormatters'
import { InvestigationMarkerBadge } from '../../research-workflow/components/SessionInvestigationBar'
import type { SessionAnalyticsSummary } from '../types'
import type { AnalyticsFilterState } from '../analyticsFilters'
import {
  analyticsRuleDrilldownPath,
  analyticsScenarioDrilldownPath,
  analyticsSessionExplainPath,
} from '../analyticsPaths'

type AnalyticsRuleEffectivenessTableProps = {
  rows: SessionAnalyticsSummary['ruleEffectiveness']
  filters?: AnalyticsFilterState
}

export function AnalyticsRuleEffectivenessTable({ rows, filters }: AnalyticsRuleEffectivenessTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.ruleEffectivenessTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{ru.analytics.ruleEffectivenessHint}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-500">{ru.analytics.noData}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-2 font-medium">{ru.analytics.colRuleId}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colTriggerCount}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colSessionShare}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colTotalImpact}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colAvgImpact}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row) => (
                <tr key={row.ruleId} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-mono text-slate-800">
                    {filters ? (
                      <Link
                        to={analyticsRuleDrilldownPath(row.ruleId, filters)}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        {row.ruleId}
                      </Link>
                    ) : (
                      row.ruleId
                    )}
                  </td>
                  <td className="px-4 py-2">{row.triggerCount}</td>
                  <td className="px-4 py-2">{row.sessionSharePercent}%</td>
                  <td className="px-4 py-2">
                    {row.totalScoreImpact > 0 ? '+' : ''}
                    {row.totalScoreImpact}
                  </td>
                  <td className="px-4 py-2">
                    {row.avgScoreImpact > 0 ? '+' : ''}
                    {row.avgScoreImpact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

type AnalyticsScenarioComparisonTableProps = {
  rows: SessionAnalyticsSummary['scenarioComparison']
  filters?: AnalyticsFilterState
}

export function AnalyticsScenarioComparisonTable({ rows, filters }: AnalyticsScenarioComparisonTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.scenarioComparisonTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{ru.analytics.scenarioComparisonHint}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-500">{ru.analytics.noData}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-2 font-medium">{ru.dashboard.colScenario}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsSessions}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colCompletedRate}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colStoppedRate}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colAbandonedRate}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsAvgRisk}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colHighRiskShare}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.scenarioId} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {filters ? (
                      <Link
                        to={analyticsScenarioDrilldownPath(row.scenarioId, filters)}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        {row.scenarioId}
                      </Link>
                    ) : (
                      row.scenarioId
                    )}
                  </td>
                  <td className="px-4 py-2">{row.sessions}</td>
                  <td className="px-4 py-2">{row.completedRate}%</td>
                  <td className="px-4 py-2">{row.stoppedRate}%</td>
                  <td className="px-4 py-2">{row.abandonedRate}%</td>
                  <td className="px-4 py-2">{row.avgRiskScore}</td>
                  <td className="px-4 py-2">{row.highRiskCountPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

type AnalyticsHighRiskTableProps = {
  rows: SessionAnalyticsSummary['highRiskSessions']
  filters?: AnalyticsFilterState
}

export function AnalyticsHighRiskTable({ rows, filters }: AnalyticsHighRiskTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.highRiskTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{ru.analytics.highRiskHint}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-500">{ru.analytics.noHighRisk}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-2 font-medium">{ru.dashboard.colSessionId}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.colScenario}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.colOutcome}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.colRiskScore}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.colRiskLevel}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.colTopFlags}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.explainTitle}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.colReplay}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sessionId} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-mono text-slate-800">
                    {row.sessionId.slice(0, 8)}…
                    <InvestigationMarkerBadge sessionId={row.sessionId} />
                  </td>
                  <td className="px-4 py-2">{row.scenarioId}</td>
                  <td className="px-4 py-2">
                    {row.outcome ? replayOutcomeLabel(row.outcome) : '—'}
                  </td>
                  <td className="px-4 py-2 font-medium">{row.riskScore}</td>
                  <td className="px-4 py-2">{riskLevelLabel(row.riskLevel)}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-600">
                    {row.topFlags.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2">
                    {filters ? (
                      <Link to={analyticsSessionExplainPath(row.sessionId, filters)}>
                        <Button variant="secondary" className="!min-h-8 !px-2 !py-1 text-xs">
                          {ru.analytics.openExplain}
                        </Button>
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">
                    <Link to={sessionReplayPath(row.sessionId)}>
                      <Button variant="secondary" className="!min-h-8 !px-2 !py-1 text-xs">
                        {ru.dashboard.openReplay}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

type AnalyticsOutcomeRiskCorrelationProps = {
  rows: SessionAnalyticsSummary['outcomeByRiskLevel']
}

export function AnalyticsOutcomeRiskCorrelation({ rows }: AnalyticsOutcomeRiskCorrelationProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.outcomeRiskTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{ru.analytics.outcomeRiskHint}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-4 py-2 font-medium">{ru.dashboard.colRiskLevel}</th>
              <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsSessions}</th>
              <th className="px-4 py-2 font-medium">{ru.analytics.colCompletedRate}</th>
              <th className="px-4 py-2 font-medium">{ru.analytics.colStoppedRate}</th>
              <th className="px-4 py-2 font-medium">{ru.analytics.colAbandonedRate}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.riskLevel} className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">{riskLevelLabel(row.riskLevel)}</td>
                <td className="px-4 py-2">{row.sessions}</td>
                <td className="px-4 py-2">{row.rates.completedRate}%</td>
                <td className="px-4 py-2">{row.rates.stoppedRate}%</td>
                <td className="px-4 py-2">{row.rates.abandonedRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
