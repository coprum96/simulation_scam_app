import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getScenarioById } from '../../../data/scenarios'
import { ru } from '../../../content/ru'
import { PageHeader } from '../../../components/layout/PageHeader'
import { PageBackActions } from '../../../components/layout/PageBackActions'
import { Card } from '../../../components/ui/Card'
import { analyticsDashboardPath } from '../analyticsPaths'
import { computeScenarioDrilldown } from '../computeDrilldownViews'
import { AnalyticsBreadcrumbs } from '../components/AnalyticsBreadcrumbs'
import { AnalyticsDrilldownMetrics } from '../components/AnalyticsDrilldownMetrics'
import { AnalyticsFilterBar } from '../components/AnalyticsFilterBar'
import {
  AnalyticsDrilldownEmptyState,
  AnalyticsPageGate,
} from '../components/AnalyticsPageEmptyStates'
import { useAnalyticsSessions } from '../useAnalyticsSessions'

export function AnalyticsScenarioDrilldownPage() {
  const { scenarioId = '' } = useParams()
  const { allEnded, filtered, filters, setFilters, analyticsSettled } = useAnalyticsSessions()

  const drilldown = useMemo(
    () => computeScenarioDrilldown(filtered, scenarioId, allEnded.length),
    [filtered, scenarioId, allEnded.length],
  )

  const scenarioTitle = getScenarioById(scenarioId)?.title ?? scenarioId

  return (
    <div>
      <AnalyticsBreadcrumbs
        items={[{ label: ru.analytics.drilldownScenario(scenarioTitle) }]}
        filters={filters}
      />

      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.analytics.drilldownScenarioTitle(scenarioTitle)}
        description={ru.analytics.drilldownScenarioDescription}
        actions={
          <PageBackActions
            analyticsTo={analyticsDashboardPath(filters)}
            showAnalytics
            showSimulations={false}
          />
        }
      />

      <AnalyticsPageGate analyticsSettled={analyticsSettled} allEndedCount={allEnded.length}>
        <div className="space-y-5 sm:space-y-6">
          <Card>
            <AnalyticsFilterBar value={filters} onChange={setFilters} />
          </Card>

          {drilldown.sessions === 0 ? (
            <AnalyticsDrilldownEmptyState />
          ) : (
            <AnalyticsDrilldownMetrics summary={drilldown.summary} filters={filters} />
          )}
        </div>
      </AnalyticsPageGate>
    </div>
  )
}
