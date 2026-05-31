import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ru } from '../../../content/ru'
import { PageHeader } from '../../../components/layout/PageHeader'
import { PageBackActions } from '../../../components/layout/PageBackActions'
import { Card } from '../../../components/ui/Card'
import { analyticsDashboardPath, analyticsFlagDrilldownPath } from '../analyticsPaths'
import { computeFlagDrilldown } from '../computeDrilldownViews'
import { AnalyticsBreadcrumbs } from '../components/AnalyticsBreadcrumbs'
import { AnalyticsDrilldownMetrics } from '../components/AnalyticsDrilldownMetrics'
import { AnalyticsFilterBar } from '../components/AnalyticsFilterBar'
import {
  AnalyticsDrilldownEmptyState,
  AnalyticsPageGate,
} from '../components/AnalyticsPageEmptyStates'
import { useAnalyticsSessions } from '../useAnalyticsSessions'

export function AnalyticsFlagDrilldownPage() {
  const { flagId = '' } = useParams()
  const { allEnded, filtered, filters, setFilters, analyticsSettled } = useAnalyticsSessions()

  const drilldown = useMemo(
    () => computeFlagDrilldown(filtered, flagId, allEnded.length),
    [filtered, flagId, allEnded.length],
  )

  return (
    <div>
      <AnalyticsBreadcrumbs items={[{ label: ru.analytics.drilldownFlag(flagId) }]} filters={filters} />

      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.analytics.drilldownFlagTitle(flagId)}
        description={ru.analytics.drilldownFlagDescription}
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
            <>
              {drilldown.coOccurringFlags.length > 0 ? (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {ru.analytics.drilldownCoOccurringFlags}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {drilldown.coOccurringFlags.map((row) => (
                      <li key={row.flagId} className="flex justify-between gap-2">
                        <Link
                          to={analyticsFlagDrilldownPath(row.flagId, filters)}
                          className="font-mono text-teal-700 hover:text-teal-900"
                        >
                          {row.flagId}
                        </Link>
                        <span className="text-slate-700">
                          {row.count} ({row.percent}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
              <AnalyticsDrilldownMetrics summary={drilldown.summary} filters={filters} />
            </>
          )}
        </div>
      </AnalyticsPageGate>
    </div>
  )
}
