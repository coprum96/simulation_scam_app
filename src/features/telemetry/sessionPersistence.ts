import { getProfileById } from '../../data/profiles'
import { DEFAULT_PROFILE_ID } from '../../config'
import type { ProfileId } from '../../types/profile'
import type { Session } from '../../types/contracts'

const STORAGE_KEY = 'scam_app_ru.sessions.v1'
export const SESSION_PERSISTENCE_SCHEMA_VERSION = 1

type PersistedSessionStoreV1 = {
  schemaVersion: 1
  selectedProfileId: ProfileId
  sessions: Session[]
}

type PersistedSessionStoreAny = {
  schemaVersion?: unknown
  selectedProfileId?: unknown
  sessions?: unknown
}

export type HydratedSessionState = {
  selectedProfileId: ProfileId
  sessions: Record<string, Session>
}

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function toSessionMap(sessions: Session[]): Record<string, Session> {
  return Object.fromEntries(sessions.map((session) => [session.record.sessionId, session]))
}

function normalizeProfileId(value: unknown): ProfileId {
  if (typeof value !== 'string') return DEFAULT_PROFILE_ID
  return getProfileById(value)?.id ?? DEFAULT_PROFILE_ID
}

export function isValidPersistedSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const session = value as Session
  if (!session.record || typeof session.record !== 'object') return false
  if (!Array.isArray(session.events)) return false
  if (!session.summary || typeof session.summary !== 'object') return false
  return typeof session.record.sessionId === 'string'
}

function readSchemaVersion(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function migratePersistedPayload(payload: PersistedSessionStoreAny): PersistedSessionStoreV1 | null {
  if (readSchemaVersion(payload.schemaVersion) === SESSION_PERSISTENCE_SCHEMA_VERSION) {
    const sessionsRaw = Array.isArray(payload.sessions) ? payload.sessions : []
    const sessions = sessionsRaw.filter(isValidPersistedSession)
    return {
      schemaVersion: 1,
      selectedProfileId: normalizeProfileId(payload.selectedProfileId),
      sessions,
    }
  }
  return null
}

function sanitizeHydratedSessions(sessions: Session[]): Session[] {
  return sessions.filter((session) => session.record.status === 'ended')
}

export function loadPersistedSessionState(): HydratedSessionState {
  if (!hasWindowStorage()) {
    return { selectedProfileId: DEFAULT_PROFILE_ID, sessions: {} }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { selectedProfileId: DEFAULT_PROFILE_ID, sessions: {} }
    }

    const parsed = JSON.parse(raw) as PersistedSessionStoreAny
    const migrated = migratePersistedPayload(parsed)
    if (!migrated) {
      return { selectedProfileId: DEFAULT_PROFILE_ID, sessions: {} }
    }

    const sessions = sanitizeHydratedSessions(migrated.sessions)
    return {
      selectedProfileId: migrated.selectedProfileId,
      sessions: toSessionMap(sessions),
    }
  } catch {
    return { selectedProfileId: DEFAULT_PROFILE_ID, sessions: {} }
  }
}

export function savePersistedSessionState(input: {
  selectedProfileId: ProfileId
  sessions: Record<string, Session>
}): void {
  if (!hasWindowStorage()) return

  const endedSessions = Object.values(input.sessions)
    .filter((session) => session.record.status === 'ended')
    .sort((a, b) => (a.record.startedAt ?? 0) - (b.record.startedAt ?? 0))

  const payload: PersistedSessionStoreV1 = {
    schemaVersion: SESSION_PERSISTENCE_SCHEMA_VERSION,
    selectedProfileId: normalizeProfileId(input.selectedProfileId),
    sessions: endedSessions,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota/storage access errors: app keeps working in-memory.
  }
}

