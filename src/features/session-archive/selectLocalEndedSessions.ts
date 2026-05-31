import type { Session } from '../../types/contracts'

export function selectLocalEndedSessions(
  sessions: Record<string, Session>,
): Record<string, Session> {
  const ended: Record<string, Session> = {}
  for (const session of Object.values(sessions)) {
    if (session.record.status === 'ended') {
      ended[session.record.sessionId] = session
    }
  }
  return ended
}
