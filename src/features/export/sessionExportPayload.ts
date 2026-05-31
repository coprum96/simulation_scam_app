import type { Session } from '../../types/contracts'
import type { SessionRiskReport } from '../../types/risk'
import type { SessionRecord, SessionSummary } from '../../types/contracts'
import type { TelemetryEvent } from '../../types/telemetry'

/** Снимок сессии для JSON export (без изменения store contracts) */
export type SessionExportPayload = {
  record: SessionRecord
  events: TelemetryEvent[]
  summary: SessionSummary
  riskReport: SessionRiskReport | null
}

export function toSessionExportPayload(session: Session): SessionExportPayload {
  return {
    record: session.record,
    events: session.events,
    summary: session.summary,
    riskReport: session.riskReport,
  }
}
