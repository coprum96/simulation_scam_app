import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { formatReplayDuration } from '../../session-replay/replayFormatters'
import type { ComparativeDrilldownMode, ComparativeDrilldownResult } from '../drilldownTypes'

type AnalyticsComparativeDrilldownPanelProps = {
  comparison: ComparativeDrilldownResult
  mode: ComparativeDrilldownMode
  sideAKey: string
  sideBKey: string
  options: string[]
  onModeChange: (mode: ComparativeDrilldownMode) => void
  onSideAChange: (key: string) => void
  onSideBChange: (key: string) => void
}

function sideLabel(mode: ComparativeDrilldownMode, key: string): string {
  if (mode === 'timeRange') {
    return key === 'prior' ? ru.analytics.comparePriorPeriod : ru.analytics.compareRecentPeriod
  }
  return key
}

function MetricRow({
  label,
  valueA,
  valueB,
  delta,
  suffix = '',
}: {
  label: string
  valueA: string | number
  valueB: string | number
  delta: number
  suffix?: string
}) {
  const deltaPrefix = delta > 0 ? '+' : ''
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-2 text-slate-700">{label}</td>
      <td className="px-4 py-2 font-medium text-slate-900">
        {valueA}
        {suffix}
      </td>
      <td className="px-4 py-2 font-medium text-slate-900">
        {valueB}
        {suffix}
      </td>
      <td className="px-4 py-2 text-slate-700">
        {deltaPrefix}
        {delta}
        {suffix}
      </td>
    </tr>
  )
}

export function AnalyticsComparativeDrilldownPanel({
  comparison,
  mode,
  sideAKey,
  sideBKey,
  options,
  onModeChange,
  onSideAChange,
  onSideBChange,
}: AnalyticsComparativeDrilldownPanelProps) {
  const { sideA, sideB, deltas } = comparison

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-base font-semibold text-slate-900">{ru.analytics.compareTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{ru.analytics.compareDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['scenario', 'timeRange', 'simulator'] as ComparativeDrilldownMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-2 text-xs font-medium ${
                mode === m
                  ? 'bg-teal-700 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {m === 'scenario'
                ? ru.analytics.compareModeScenario
                : m === 'simulator'
                  ? ru.analytics.compareModeSimulator
                  : ru.analytics.compareModeTimeRange}
            </button>
          ))}
        </div>

        {mode !== 'timeRange' && options.length >= 2 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-slate-500">
              {ru.analytics.compareSideA}
              <select
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                value={sideAKey}
                onChange={(e) => onSideAChange(e.target.value)}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {sideLabel(mode, opt)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-500">
              {ru.analytics.compareSideB}
              <select
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                value={sideBKey}
                onChange={(e) => onSideBChange(e.target.value)}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {sideLabel(mode, opt)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-2 font-medium">{ru.analytics.compareMetric}</th>
                <th className="px-4 py-2 font-medium">{sideLabel(mode, sideA.label)}</th>
                <th className="px-4 py-2 font-medium">{sideLabel(mode, sideB.label)}</th>
                <th className="px-4 py-2 font-medium">{ru.analytics.compareDelta}</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label={ru.dashboard.analyticsSessions}
                valueA={sideA.sessions}
                valueB={sideB.sessions}
                delta={sideB.sessions - sideA.sessions}
              />
              <MetricRow
                label={ru.analytics.colCompletedRate}
                valueA={sideA.completedRate}
                valueB={sideB.completedRate}
                delta={deltas.completedRate}
                suffix="%"
              />
              <MetricRow
                label={ru.analytics.colAbandonedRate}
                valueA={sideA.abandonedRate}
                valueB={sideB.abandonedRate}
                delta={deltas.abandonedRate}
                suffix="%"
              />
              <MetricRow
                label={ru.dashboard.analyticsAvgRisk}
                valueA={sideA.avgRiskScore}
                valueB={sideB.avgRiskScore}
                delta={deltas.avgRiskScore}
              />
              <MetricRow
                label={ru.analytics.colHighRiskShare}
                valueA={sideA.highRiskPercent}
                valueB={sideB.highRiskPercent}
                delta={deltas.highRiskPercent}
                suffix="%"
              />
              <tr className="border-b border-slate-100">
                <td className="px-4 py-2 text-slate-700">{ru.analytics.kpiAvgDuration}</td>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {formatReplayDuration(sideA.avgDurationMs)}
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {formatReplayDuration(sideB.avgDurationMs)}
                </td>
                <td className="px-4 py-2 text-slate-700">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
