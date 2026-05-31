import { Link } from 'react-router-dom'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import {
  analyticsComparePath,
  analyticsScenarioDrilldownPath,
} from '../analyticsPaths'
import type { AnalyticsFilterState } from '../analyticsFilters'
import type { AnalyticsInsights } from '../drilldownTypes'
import { formatInsightNarrative } from '../insightNarratives'

type AnalyticsInsightsPanelProps = {
  insights: AnalyticsInsights
  filters: AnalyticsFilterState
}

export function AnalyticsInsightsPanel({ insights, filters }: AnalyticsInsightsPanelProps) {
  const { highRiskConcentration, topScenarioChanges, outcomeNarratives, periodLabel } = insights

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{ru.analytics.insightsTitle}</h2>
        <Link
          to={analyticsComparePath({ mode: 'scenario' }, filters)}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          {ru.analytics.openCompareView}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.insightScenarioChangesTitle}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {periodLabel === 'splitHalf'
              ? ru.analytics.insightScenarioChangesHint
              : ru.analytics.insightInsufficientPeriod}
          </p>
          {topScenarioChanges.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{ru.analytics.noData}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {topScenarioChanges.map((row) => (
                <li key={row.scenarioId} className="flex items-center justify-between gap-2">
                  <Link
                    to={analyticsScenarioDrilldownPath(row.scenarioId, filters)}
                    className="truncate font-medium text-teal-700 hover:text-teal-900"
                  >
                    {row.scenarioId}
                  </Link>
                  <span className="shrink-0 text-slate-700">
                    {row.delta >= 0 ? '+' : ''}
                    {row.delta} ({row.deltaPercent >= 0 ? '+' : ''}
                    {row.deltaPercent}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.insightHighRiskTitle}</h3>
          <p className="mt-1 text-xs text-slate-500">{ru.analytics.insightHighRiskHint}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {highRiskConcentration.overallHighRiskPercent}%
          </p>
          {highRiskConcentration.topScenarios.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{ru.analytics.noHighRisk}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {highRiskConcentration.topScenarios.map((row) => (
                <li key={row.scenarioId} className="flex justify-between gap-2">
                  <span className="truncate text-slate-700">{row.scenarioId}</span>
                  <span className="shrink-0 font-medium text-slate-900">
                    {row.highRiskCount} ({row.concentrationPercent}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
          {highRiskConcentration.dominantFlag ? (
            <p className="mt-3 text-xs text-slate-600">
              {ru.analytics.insightDominantFlag(
                highRiskConcentration.dominantFlag,
                highRiskConcentration.dominantFlagSessions,
              )}
            </p>
          ) : null}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.insightOutcomeNarrativesTitle}</h3>
          <p className="mt-1 text-xs text-slate-500">{ru.analytics.insightOutcomeNarrativesHint}</p>
          {outcomeNarratives.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{ru.analytics.noData}</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {outcomeNarratives.map((row) => (
                <li key={row.riskLevel}>
                  {formatInsightNarrative(row)}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
