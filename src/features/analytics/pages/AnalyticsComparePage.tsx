import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ru } from '../../../content/ru'
import { PageHeader } from '../../../components/layout/PageHeader'
import { PageBackActions } from '../../../components/layout/PageBackActions'
import { Card } from '../../../components/ui/Card'
import { analyticsComparePath, analyticsDashboardPath } from '../analyticsPaths'
import {
  computeComparativeDrilldown,
  listComparativeOptions,
} from '../computeComparativeDrilldown'
import { parseCompareDrilldownMode } from '../analyticsSearchParams'
import { AnalyticsBreadcrumbs } from '../components/AnalyticsBreadcrumbs'
import { AnalyticsComparativeDrilldownPanel } from '../components/AnalyticsComparativeDrilldownPanel'
import { AnalyticsFilterBar } from '../components/AnalyticsFilterBar'
import {
  AnalyticsCompareInsufficientState,
  AnalyticsFilteredEmptyState,
  AnalyticsPageGate,
} from '../components/AnalyticsPageEmptyStates'
import { useAnalyticsSessions } from '../useAnalyticsSessions'

export function AnalyticsComparePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { allEnded, filtered, filters, setFilters, analyticsSettled } = useAnalyticsSessions()

  const mode = parseCompareDrilldownMode(searchParams.get('mode'))
  const options = useMemo(() => listComparativeOptions(filtered, mode), [filtered, mode])

  const sideAKey = searchParams.get('a') ?? options[0] ?? ''
  const sideBKey =
    searchParams.get('b') ?? options.find((opt) => opt !== sideAKey) ?? options[1] ?? ''

  const comparison = useMemo(
    () => computeComparativeDrilldown(filtered, mode, sideAKey, sideBKey),
    [filtered, mode, sideAKey, sideBKey],
  )

  const updateCompare = (next: { mode?: typeof mode; a?: string; b?: string }) => {
    navigate(
      analyticsComparePath(
        {
          mode: next.mode ?? mode,
          a: next.a ?? sideAKey,
          b: next.b ?? sideBKey,
        },
        filters,
      ),
    )
  }

  return (
    <div>
      <AnalyticsBreadcrumbs items={[{ label: ru.analytics.compareBreadcrumb }]} filters={filters} />

      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.analytics.compareTitle}
        description={ru.analytics.compareDescription}
        actions={
          <PageBackActions
            analyticsTo={analyticsDashboardPath(filters)}
            showAnalytics
            showSimulations={false}
          />
        }
      />

      <AnalyticsPageGate analyticsSettled={analyticsSettled} allEndedCount={allEnded.length}>
        {filtered.length === 0 ? (
          <AnalyticsFilteredEmptyState />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <Card>
              <AnalyticsFilterBar value={filters} onChange={setFilters} />
            </Card>

            {!comparison ? (
              <AnalyticsCompareInsufficientState />
            ) : (
              <AnalyticsComparativeDrilldownPanel
                comparison={comparison}
                mode={mode}
                sideAKey={sideAKey}
                sideBKey={sideBKey}
                options={options}
                onModeChange={(m) => {
                  const nextOptions = listComparativeOptions(filtered, m)
                  updateCompare({
                    mode: m,
                    a: nextOptions[0],
                    b: nextOptions.find((o) => o !== nextOptions[0]) ?? nextOptions[1],
                  })
                }}
                onSideAChange={(a) => updateCompare({ a })}
                onSideBChange={(b) => updateCompare({ b })}
              />
            )}
          </div>
        )}
      </AnalyticsPageGate>
    </div>
  )
}
