import type { Session } from '../../types/contracts'
import { normalizeSessionForAnalytics } from './normalizeSessionForAnalytics'

/** Local ended sessions override archive entries with the same sessionId. */
export function mergeAnalyticsSessionSources(
  localSessions: Record<string, Session>,
  archivedSessions: Session[],
): Record<string, Session> {
  const merged: Record<string, Session> = {}

  for (const session of archivedSessions) {
    const normalized = normalizeSessionForAnalytics(session)
    if (normalized) merged[normalized.record.sessionId] = normalized
  }

  for (const session of Object.values(localSessions)) {
    const normalized = normalizeSessionForAnalytics(session)
    if (normalized) merged[normalized.record.sessionId] = normalized
  }

  return merged
}
