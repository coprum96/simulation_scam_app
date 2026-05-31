import type { Session } from '../../types/contracts'
import { normalizeSessionsForAnalytics } from './normalizeSessionForAnalytics'

export function toArchivedSessionMap(sessions: Session[]): Record<string, Session> {
  const map: Record<string, Session> = {}
  for (const session of normalizeSessionsForAnalytics(sessions)) {
    map[session.record.sessionId] = session
  }
  return map
}
