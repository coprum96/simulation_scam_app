import { ru } from '../../../content/ru'
import type { SessionSummary } from '../../../types/contracts'
import { Card } from '../../../components/ui/Card'
import { formatReplayDelay, formatReplayDuration } from '../replayFormatters'

type ReplaySummaryBlockProps = {
  summary: SessionSummary
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  )
}

export function ReplaySummaryBlock({ summary }: ReplaySummaryBlockProps) {
  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-slate-900">{ru.replay.summaryTitle}</h2>
      <dl className="space-y-2">
        <SummaryRow label={ru.replay.duration} value={formatReplayDuration(summary.totalDurationMs)} />
        <SummaryRow label={ru.replay.screensVisited} value={summary.screensVisited} />
        <SummaryRow label={ru.replay.totalEvents} value={summary.totalEvents} />
        <SummaryRow label={ru.replay.warningsSeen} value={summary.warningsSeen} />
        <SummaryRow label={ru.replay.warningsIgnored} value={summary.warningsIgnored} />
        <SummaryRow label={ru.replay.fieldEditCount} value={summary.fieldEditCount} />
        <SummaryRow label={ru.replay.backNavigationCount} value={summary.backNavigationCount} />
        <SummaryRow
          label={ru.replay.confirmationDelay}
          value={formatReplayDelay(summary.confirmationDelayMs)}
        />
      </dl>
    </Card>
  )
}
