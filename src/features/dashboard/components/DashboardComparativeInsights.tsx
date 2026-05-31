import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import { formatReplayDuration } from '../../session-replay/replayFormatters'
import type { ComparativeAnalytics } from '../../analytics/sessionComparativeAnalytics'

type DashboardComparativeInsightsProps = {
  analytics: ComparativeAnalytics
}

function SmallList({
  title,
  rows,
}: {
  title: string
  rows: Array<{ key: string; count: number }>
}) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">{ru.dashboard.analyticsNoData}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {rows.map((row) => (
            <li key={row.key} className="flex justify-between gap-4">
              <span className="truncate text-slate-700">{row.key}</span>
              <span className="font-medium text-slate-900">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function GroupTable({
  title,
  rows,
}: {
  title: string
  rows: ComparativeAnalytics['comparisons']['byScenario']
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-500">{ru.dashboard.analyticsNoData}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsGroup}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsSessions}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsAvgRisk}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsCompleted}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsStopped}</th>
                <th className="px-4 py-2 font-medium">{ru.dashboard.analyticsAbandoned}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((row) => (
                <tr key={row.key} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-slate-700">{row.key}</td>
                  <td className="px-4 py-2 text-slate-700">{row.sessions}</td>
                  <td className="px-4 py-2 text-slate-700">{row.averageRiskScore}</td>
                  <td className="px-4 py-2 text-slate-700">{row.completed}</td>
                  <td className="px-4 py-2 text-slate-700">{row.stopped}</td>
                  <td className="px-4 py-2 text-slate-700">{row.abandoned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export function DashboardComparativeInsights({ analytics }: DashboardComparativeInsightsProps) {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {ru.dashboard.analyticsTitle}
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{ru.dashboard.analyticsCompleted}</dt>
            <dd className="text-lg font-semibold text-slate-900">{analytics.outcomes.completed}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{ru.dashboard.analyticsStopped}</dt>
            <dd className="text-lg font-semibold text-slate-900">{analytics.outcomes.stopped}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{ru.dashboard.analyticsAbandoned}</dt>
            <dd className="text-lg font-semibold text-slate-900">{analytics.outcomes.abandoned}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{ru.dashboard.analyticsAvgDuration}</dt>
            <dd className="text-lg font-semibold text-slate-900">
              {formatReplayDuration(analytics.averages.durationMs)}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {ru.dashboard.analyticsWarningsTitle}
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsWarningsSeen}</dt>
              <dd className="font-medium text-slate-900">{analytics.warningBehavior.totalSeen}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsWarningsIgnored}</dt>
              <dd className="font-medium text-slate-900">{analytics.warningBehavior.totalIgnored}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsIgnoredRate}</dt>
              <dd className="font-medium text-slate-900">
                {analytics.warningBehavior.ignoredRatePercent}%
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {ru.dashboard.analyticsFlagCompareTitle}
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsFlagsMatched}</dt>
              <dd className="font-medium text-slate-900">
                {analytics.flagComparison.matchedExpectedTotal}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsFlagsMissed}</dt>
              <dd className="font-medium text-slate-900">
                {analytics.flagComparison.missedExpectedTotal}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsFlagsUnexpected}</dt>
              <dd className="font-medium text-slate-900">{analytics.flagComparison.unexpectedTotal}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SmallList
          title={ru.dashboard.analyticsMostIgnoredWarnings}
          rows={analytics.warningBehavior.mostIgnoredWarnings}
        />
        <SmallList
          title={ru.dashboard.analyticsMostAbandonPoints}
          rows={analytics.patterns.mostCommonAbandonPoints}
        />
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {ru.dashboard.analyticsConfirmCancelTitle}
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsSessionsWithConfirm}</dt>
              <dd className="font-medium text-slate-900">{analytics.patterns.sessionsWithConfirm}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsSessionsWithCancel}</dt>
              <dd className="font-medium text-slate-900">{analytics.patterns.sessionsWithCancel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{ru.dashboard.analyticsSessionsWithBoth}</dt>
              <dd className="font-medium text-slate-900">{analytics.patterns.sessionsWithBoth}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SmallList
          title={ru.dashboard.analyticsMostMatchedFlags}
          rows={analytics.flagComparison.mostMatchedExpected}
        />
        <SmallList
          title={ru.dashboard.analyticsMostMissedFlags}
          rows={analytics.flagComparison.mostMissedExpected}
        />
        <SmallList
          title={ru.dashboard.analyticsMostUnexpectedFlags}
          rows={analytics.flagComparison.mostUnexpected}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GroupTable title={ru.dashboard.analyticsByScenario} rows={analytics.comparisons.byScenario} />
        <GroupTable title={ru.dashboard.analyticsByProfile} rows={analytics.comparisons.byProfile} />
        <GroupTable title={ru.dashboard.analyticsBySimulator} rows={analytics.comparisons.bySimulator} />
      </div>
    </div>
  )
}

