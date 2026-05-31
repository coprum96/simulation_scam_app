import type { Session } from '../../types/contracts'

/** Stable key for ended local sessions — avoids refetching archive on unrelated store updates. */
export function buildEndedLocalSessionKey(localSessions: Record<string, Session>): string {
  return Object.values(localSessions)
    .filter((s) => s.record.status === 'ended')
    .map((s) => s.record.sessionId)
    .sort()
    .join('|')
}
