import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import { formatReplayDuration } from '../../session-replay/replayFormatters'
import type { SessionAnalyticsSummary } from '../types'

type AnalyticsKpiStripProps = {
  summary: SessionAnalyticsSummary
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs font-medium leading-relaxed text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </Card>
  )
}

export function AnalyticsKpiStrip({ summary }: AnalyticsKpiStripProps) {
  const { outcomeRates, meta } = summary
  const highRisk = summary.riskLevelDistribution.find((r) => r.key === 'high')?.count ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard label={ru.analytics.kpiFilteredSessions} value={meta.filteredSessions} />
      <KpiCard label={ru.analytics.kpiCompletionRate} value={`${outcomeRates.completedRate}%`} />
      <KpiCard label={ru.analytics.kpiAbandonmentRate} value={`${outcomeRates.abandonedRate}%`} />
      <KpiCard label={ru.analytics.kpiStoppedRate} value={`${outcomeRates.stoppedRate}%`} />
      <KpiCard
        label={ru.analytics.kpiAvgDuration}
        value={formatReplayDuration(summary.avgDurationMs)}
      />
      <KpiCard label={ru.analytics.kpiHighRiskSessions} value={highRisk} />
    </div>
  )
}
