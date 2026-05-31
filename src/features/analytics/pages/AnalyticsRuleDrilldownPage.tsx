import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ru } from '../../../content/ru'
import { PageHeader } from '../../../components/layout/PageHeader'
import { PageBackActions } from '../../../components/layout/PageBackActions'
import { Card } from '../../../components/ui/Card'
import {
  analyticsDashboardPath,
  analyticsFlagDrilldownPath,
} from '../analyticsPaths'
import { computeRuleDrilldown } from '../computeDrilldownViews'
import { AnalyticsBreadcrumbs } from '../components/AnalyticsBreadcrumbs'
import { AnalyticsDrilldownMetrics } from '../components/AnalyticsDrilldownMetrics'
import { AnalyticsFilterBar } from '../components/AnalyticsFilterBar'
import {
  AnalyticsDrilldownEmptyState,
  AnalyticsPageGate,
} from '../components/AnalyticsPageEmptyStates'
import { useAnalyticsSessions } from '../useAnalyticsSessions'

export function AnalyticsRuleDrilldownPage() {
  const { ruleId = '' } = useParams()
  const { allEnded, filtered, filters, setFilters, analyticsSettled } = useAnalyticsSessions()

  const drilldown = useMemo(
    () => computeRuleDrilldown(filtered, ruleId, allEnded.length),
    [filtered, ruleId, allEnded.length],
  )

  const eff = drilldown.effectiveness

  return (
    <div>
      <AnalyticsBreadcrumbs items={[{ label: ru.analytics.drilldownRule(ruleId) }]} filters={filters} />

      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.analytics.drilldownRuleTitle(ruleId)}
        description={ru.analytics.drilldownRuleDescription}
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
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-slate-900">{ru.analytics.ruleEffectivenessTitle}</h3>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs text-slate-500">{ru.analytics.colTriggerCount}</dt>
                    <dd className="font-semibold">{eff.triggerCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{ru.analytics.colSessionShare}</dt>
                    <dd className="font-semibold">{eff.sessionSharePercent}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{ru.analytics.colTotalImpact}</dt>
                    <dd className="font-semibold">
                      {eff.totalScoreImpact > 0 ? '+' : ''}
                      {eff.totalScoreImpact}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{ru.analytics.colAvgImpact}</dt>
                    <dd className="font-semibold">
                      {eff.avgScoreImpact > 0 ? '+' : ''}
                      {eff.avgScoreImpact}
                    </dd>
                  </div>
                </dl>
                {drilldown.relatedFlags.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500">{ru.analytics.drilldownRelatedFlags}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {drilldown.relatedFlags.map((row) => (
                        <li key={row.flagId}>
                          <Link
                            to={analyticsFlagDrilldownPath(row.flagId, filters)}
                            className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-teal-800 hover:bg-slate-200"
                          >
                            {row.flagId} ({row.count})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
              <AnalyticsDrilldownMetrics summary={drilldown.summary} filters={filters} />
            </>
          )}
        </div>
      </AnalyticsPageGate>
    </div>
  )
}
