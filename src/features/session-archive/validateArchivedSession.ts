import type { Session } from '../../types/contracts'
import { isValidPersistedSession } from '../telemetry/sessionPersistence'

export function isValidArchivedSession(value: unknown): value is Session {
  if (!isValidPersistedSession(value)) return false
  return value.record.status === 'ended'
}

export function filterValidArchivedSessions(sessions: Session[]): Session[] {
  return sessions.filter(isValidArchivedSession)
}
