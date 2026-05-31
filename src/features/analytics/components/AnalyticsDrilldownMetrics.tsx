import { riskLevelLabel } from '../../../config'
import { ru } from '../../../content/ru'
import { replayOutcomeLabel } from '../../session-replay/replayFormatters'
import { analyticsFlagDrilldownPath } from '../analyticsPaths'
import type { AnalyticsFilterState } from '../analyticsFilters'
import type { SessionAnalyticsSummary } from '../types'
import { AnalyticsBarChart } from './AnalyticsBarChart'
import { AnalyticsKpiStrip } from './AnalyticsKpiStrip'
import {
  AnalyticsHighRiskTable,
  AnalyticsOutcomeRiskCorrelation,
  AnalyticsRuleEffectivenessTable,
  AnalyticsScenarioComparisonTable,
} from './AnalyticsTables'

type AnalyticsDrilldownMetricsProps = {
  summary: SessionAnalyticsSummary
  filters: AnalyticsFilterState
  showScenarioTable?: boolean
}

export function AnalyticsDrilldownMetrics({
  summary,
  filters,
  showScenarioTable = false,
}: AnalyticsDrilldownMetricsProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <AnalyticsKpiStrip summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title={ru.analytics.outcomeDistributionTitle}
          emptyLabel={ru.analytics.noData}
          items={summary.outcomeDistribution.map((row) => ({
            label: replayOutcomeLabel(row.key as 'completed' | 'stopped' | 'abandoned'),
            count: row.count,
            percent: row.percent,
            tone: row.key === 'completed' ? 'teal' : row.key === 'stopped' ? 'amber' : 'rose',
          }))}
        />
        <AnalyticsBarChart
          title={ru.analytics.riskLevelDistributionTitle}
          emptyLabel={ru.analytics.noData}
          items={summary.riskLevelDistribution.map((row) => ({
            label: riskLevelLabel(row.key as 'low' | 'medium' | 'high'),
            count: row.count,
            percent: row.percent,
            tone: row.key === 'high' ? 'rose' : row.key === 'medium' ? 'amber' : 'slate',
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title={ru.analytics.topRiskFlagsTitle}
          emptyLabel={ru.analytics.noData}
          items={summary.topRiskFlags.map((row) => ({
            label: row.key,
            count: row.count,
            percent: row.percent,
            tone: 'amber',
            href: analyticsFlagDrilldownPath(row.key, filters),
          }))}
        />
        <AnalyticsRuleEffectivenessTable
          rows={summary.ruleEffectiveness}
          filters={filters}
        />
      </div>

      {showScenarioTable ? (
        <AnalyticsScenarioComparisonTable rows={summary.scenarioComparison} filters={filters} />
      ) : null}

      <AnalyticsOutcomeRiskCorrelation rows={summary.outcomeByRiskLevel} />
      <AnalyticsHighRiskTable rows={summary.highRiskSessions} filters={filters} />
    </div>
  )
}
