import { ru } from '../../../content/ru'
import type { DashboardKpis } from '../dashboardMetrics'
import { Card } from '../../../components/ui/Card'

type DashboardKpiCardsProps = {
  kpis: DashboardKpis
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs font-medium leading-relaxed text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </Card>
  )
}

export function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label={ru.dashboard.kpiTotalEnded} value={kpis.totalEnded} />
      <KpiCard label={ru.dashboard.kpiAvgRiskScore} value={kpis.averageRiskScore} />
      <KpiCard label={ru.dashboard.kpiHighRisk} value={kpis.highRiskCount} />
      <KpiCard label={ru.dashboard.kpiAbandoned} value={kpis.abandonedCount} />
    </div>
  )
}
