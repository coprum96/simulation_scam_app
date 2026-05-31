import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, riskLevelLabel } from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  markAnalyticsVisited,
  ResearchNextStepsPanel,
  ResearchQuickFilters,
  ResearchWorkflowPanel,
  shouldShowExpandedWorkflow,
} from '../research-workflow'
import { DashboardComparativeInsights } from '../dashboard/components/DashboardComparativeInsights'
import { DashboardSessionsTable } from '../dashboard/components/DashboardSessionsTable'
import { computeAnalyticsInsights } from './computeAnalyticsInsights'
import {
  analyticsComparePath,
  analyticsFlagDrilldownPath,
  analyticsScenarioDrilldownPath,
} from './analyticsPaths'
import { AnalyticsBarChart } from './components/AnalyticsBarChart'
import { AnalyticsExportPanel } from './components/AnalyticsExportPanel'
import {
  AnalyticsFilteredEmptyState,
  AnalyticsNoEndedState,
  AnalyticsLoadingState,
} from './components/AnalyticsPageEmptyStates'
import { AnalyticsFilterBar } from './components/AnalyticsFilterBar'
import { AnalyticsInsightsPanel } from './components/AnalyticsInsightsPanel'
import { AnalyticsKpiStrip } from './components/AnalyticsKpiStrip'
import {
  AnalyticsHighRiskTable,
  AnalyticsOutcomeRiskCorrelation,
  AnalyticsRuleEffectivenessTable,
  AnalyticsScenarioComparisonTable,
} from './components/AnalyticsTables'
import { replayOutcomeLabel } from '../session-replay/replayFormatters'
import { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
import { useAnalyticsSessions } from './useAnalyticsSessions'

export function AnalyticsDashboardPage() {
  const {
    allEnded,
    filtered,
    filters,
    setFilters,
    summary,
    archiveError,
    analyticsSettled,
    workflowPresetId,
  } = useAnalyticsSessions()

  useEffect(() => {
    markAnalyticsVisited()
  }, [])

  const insights = useMemo(
    () => computeAnalyticsInsights(filtered, summary),
    [filtered, summary],
  )

  return (
    <AnalyticsErrorBoundary>
      <div>
        <PageHeader
          eyebrow={ru.nav.groupStudy}
          title={ru.analytics.pageTitle}
          description={ru.analytics.pageDescription}
          actions={
            <div className="flex flex-wrap gap-2">
              <Link to={analyticsComparePath({ mode: 'scenario' }, filters)}>
                <Button variant="secondary">{ru.analytics.openCompareView}</Button>
              </Link>
              <Link to={ROUTES.scenarios}>
                <Button variant="secondary">{ru.actions.backToSimulations}</Button>
              </Link>
            </div>
          }
        />

        {!analyticsSettled ? (
          <AnalyticsLoadingState />
        ) : allEnded.length === 0 ? (
          <AnalyticsNoEndedState />
        ) : (
          <div className="space-y-6">
            <ResearcherHint tone="muted">
              {archiveError ? ru.archive.analyticsArchiveUnavailable : ru.researcher.analyticsHint}
            </ResearcherHint>

            <ResearchWorkflowPanel
              pageStep="analytics"
              hasAnySessions={allEnded.length > 0}
              compact={!shouldShowExpandedWorkflow()}
            />

            <ResearchNextStepsPanel
              variant="analytics"
              filters={filters}
              highRiskCount={summary.highRiskSessions.length}
            />

            <AnalyticsKpiStrip summary={summary} />

            <Card>
              <AnalyticsFilterBar value={filters} onChange={(next) => setFilters(next)} />
              <ResearchQuickFilters
                activePresetId={workflowPresetId}
                onSelectPreset={(presetId, presetFilters) => setFilters(presetFilters, presetId)}
              />
            </Card>

            <AnalyticsExportPanel
              filtered={filtered}
              summary={summary}
              disabled={filtered.length === 0}
            />

            {filtered.length === 0 ? (
              <AnalyticsFilteredEmptyState />
            ) : (
              <>
                <AnalyticsInsightsPanel insights={insights} filters={filters} />

                <div className="grid gap-4 lg:grid-cols-2">
                  <AnalyticsBarChart
                    title={ru.analytics.outcomeDistributionTitle}
                    emptyLabel={ru.analytics.noData}
                    items={summary.outcomeDistribution.map((row) => ({
                      label: replayOutcomeLabel(row.key as 'completed' | 'stopped' | 'abandoned'),
                      count: row.count,
                      percent: row.percent,
                      tone:
                        row.key === 'completed' ? 'teal' : row.key === 'stopped' ? 'amber' : 'rose',
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
                    title={ru.analytics.sessionsByScenarioTitle}
                    emptyLabel={ru.analytics.noData}
                    items={summary.sessionsByScenario.map((row) => ({
                      label: row.key,
                      count: row.count,
                      percent: row.percent,
                      href: analyticsScenarioDrilldownPath(row.key, filters),
                    }))}
                  />
                  <AnalyticsBarChart
                    title={ru.analytics.riskScoreDistributionTitle}
                    emptyLabel={ru.analytics.noData}
                    items={summary.riskScoreDistribution.map((row) => ({
                      label: row.rangeLabel,
                      count: row.count,
                      percent: row.percent,
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

                <AnalyticsScenarioComparisonTable
                  rows={summary.scenarioComparison}
                  filters={filters}
                />
                <AnalyticsOutcomeRiskCorrelation rows={summary.outcomeByRiskLevel} />
                <div id="high-risk-sessions">
                  <AnalyticsHighRiskTable rows={summary.highRiskSessions} filters={filters} />
                </div>

                <DashboardComparativeInsights analytics={summary.comparative} />
                <DashboardSessionsTable sessions={filtered} />
              </>
            )}
          </div>
        )}
      </div>
    </AnalyticsErrorBoundary>
  )
}
