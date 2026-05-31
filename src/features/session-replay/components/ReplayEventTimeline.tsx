import { ru } from '../../../content/ru'
import type { TelemetryEvent } from '../../../types/telemetry'
import { Card } from '../../../components/ui/Card'
import {
  formatEventMeta,
  formatReplayTimestamp,
  replayEventTypeLabel,
} from '../replayFormatters'

type ReplayEventTimelineProps = {
  events: TelemetryEvent[]
}

export function ReplayEventTimeline({ events }: ReplayEventTimelineProps) {
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-slate-900">{ru.replay.timelineTitle}</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-600">{ru.replay.noEvents}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="px-3 py-2.5 pr-3 font-medium">{ru.replay.eventIndex}</th>
                <th className="px-3 py-2.5 pr-3 font-medium">{ru.replay.eventTime}</th>
                <th className="px-3 py-2.5 pr-3 font-medium">{ru.replay.eventType}</th>
                <th className="px-3 py-2.5 pr-3 font-medium">{ru.replay.eventScreen}</th>
                <th className="px-3 py-2.5 font-medium">{ru.replay.eventMeta}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((event, index) => (
                <tr key={event.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2.5 pr-3 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2.5 pr-3 whitespace-nowrap text-slate-700">
                    {formatReplayTimestamp(event.timestamp)}
                  </td>
                  <td className="px-3 py-2.5 pr-3 text-slate-900">
                    {replayEventTypeLabel(event.eventType)}
                  </td>
                  <td className="px-3 py-2.5 pr-3 font-mono text-xs text-slate-600">{event.screenId}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500 break-all">
                    {formatEventMeta(event.meta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
