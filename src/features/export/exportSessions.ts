import type { Session } from '../../types/contracts'
import { downloadJsonFile, formatExportTimestamp } from './downloadJson'
import { toSessionExportPayload, type SessionExportPayload } from './sessionExportPayload'

export function sessionsExportFilename(timestamp = formatExportTimestamp()): string {
  return `sessions_export_${timestamp}.json`
}

export function sessionExportFilename(sessionId: string): string {
  return `session_${sessionId}.json`
}

export function buildSessionsExportPayload(sessions: Session[]): SessionExportPayload[] {
  return sessions.map(toSessionExportPayload)
}

export function exportSessionsJson(sessions: Session[]): void {
  const payload = buildSessionsExportPayload(sessions)
  downloadJsonFile(payload, sessionsExportFilename())
}

export function exportSessionJson(session: Session): void {
  downloadJsonFile(toSessionExportPayload(session), sessionExportFilename(session.record.sessionId))
}
