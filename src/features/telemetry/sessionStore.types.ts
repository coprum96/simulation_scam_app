import type { Session, SessionRecord, SessionSummary } from '../../types/session'
import type { LogEventInput, TelemetryEvent } from '../../types/telemetry'
import type { SimulatorType } from '../../types/scenario'
import type { ProfileId } from '../../types/profile'

/** Публичный API session store (без привязки к UI-компонентам) */
export type SessionStoreState = {
  sessions: Record<string, Session>
  activeSessionId: string | null
  selectedProfileId: ProfileId
  startSession: (
    scenarioId: string,
    profileId: ProfileId,
    simulatorType: SimulatorType,
  ) => string
  clearActiveSession: () => void
  endSession: (input: EndSessionInput) => void
  logEvent: (input: LogEventInput) => TelemetryEvent | null
  setSelectedProfileId: (profileId: ProfileId) => void
  getActiveSession: () => Session | null
  getSession: (sessionId: string) => Session | null
}

export type EndSessionInput = {
  sessionId?: string
  screenId: string
  meta?: Record<string, unknown>
}

export type { Session, SessionRecord, SessionSummary, TelemetryEvent, LogEventInput }
