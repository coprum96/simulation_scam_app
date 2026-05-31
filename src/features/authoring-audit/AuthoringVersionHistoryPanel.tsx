import { useEffect, useState } from 'react'
import { ru } from '../../content/ru'
import { Card } from '../../components/ui/Card'
import { getRegistryBootstrapState } from '../../registry/bootstrapRegistry'
import type { AuditEvent, AuditEntityType } from '../../types/audit'
import { formatActorName, formatAuditAction, formatAuditTimestamp } from './formatAudit'

type AuthoringVersionHistoryPanelProps = {
  entityType: AuditEntityType
  entityId: string
  version?: number
  fetchEvents: () => Promise<AuditEvent[]>
}

export function AuthoringVersionHistoryPanel({
  entityType,
  entityId,
  version,
  fetchEvents,
}: AuthoringVersionHistoryPanelProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const backendActive =
    getRegistryBootstrapState().status === 'ready' &&
    getRegistryBootstrapState().source === 'backend'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchEvents()
      .then((list) => {
        if (!cancelled) setEvents(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchEvents, entityId, entityType, version])

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-900">{ru.audit.historyTitle}</h3>
      <p className="mt-1 text-xs text-slate-500">{ru.audit.historyDescription}</p>
      {!backendActive ? (
        <p className="mt-3 text-xs text-amber-800">{ru.audit.historyOfflineHint}</p>
      ) : null}
      {loading ? (
        <p className="mt-3 text-sm text-slate-500">{ru.registry.loading}</p>
      ) : events.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">{ru.audit.historyEmpty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-medium">{ru.audit.colTimestamp}</th>
                <th className="py-2 pr-3 font-medium">{ru.audit.colAction}</th>
                <th className="py-2 pr-3 font-medium">{ru.audit.colVersion}</th>
                <th className="py-2 pr-3 font-medium">{ru.audit.colActor}</th>
                <th className="py-2 pr-3 font-medium">{ru.audit.colNote}</th>
                <th className="py-2 font-medium">{ru.audit.colSummary}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-slate-700">
                    {formatAuditTimestamp(event.timestamp)}
                  </td>
                  <td className="py-2 pr-3 text-slate-900">{formatAuditAction(event.action)}</td>
                  <td className="py-2 pr-3 font-mono">v{event.version}</td>
                  <td className="py-2 pr-3">{formatActorName(event.actor.displayName)}</td>
                  <td className="py-2 pr-3 max-w-[160px] whitespace-pre-wrap text-slate-600">
                    {event.note ?? '—'}
                  </td>
                  <td className="py-2 max-w-[220px] whitespace-pre-wrap text-slate-600">
                    {event.changeSummary ?? '—'}
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
