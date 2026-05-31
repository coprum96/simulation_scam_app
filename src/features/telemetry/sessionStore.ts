import { create } from 'zustand'
import type { Session, SessionRecord } from '../../types/session'
import type { ProfileId } from '../../types/profile'
import type { LogEventInput, TelemetryEvent } from '../../types/telemetry'
import { SCREEN_IDS } from '../../config'
import { getScenarioById } from '../../data/scenarios'
import { buildSessionRiskReport, evaluateRisk } from '../risk-engine'
import { applyRiskToRecord, applyRiskToSession } from './applyRisk'
import { computeSessionSummary } from './computeSessionSummary'
import { loadPersistedSessionState, savePersistedSessionState } from './sessionPersistence'
import { sessionOutcomeFromExitMeta } from './sessionOutcomeFromMeta'
import { archiveEndedSessionInBackground } from '../session-archive/archiveOnEnd'
import type { EndSessionInput, SessionStoreState } from './sessionStore.types'

function createSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function activeRecordBase(
  partial: Omit<
    SessionRecord,
    'riskScore' | 'riskLevel' | 'riskFlags' | 'endedAt' | 'status' | 'outcome'
  > &
    Pick<SessionRecord, 'startedAt'>,
): SessionRecord {
  return {
    ...partial,
    endedAt: null,
    status: 'active',
    outcome: null,
    riskScore: null,
    riskLevel: null,
    riskFlags: null,
  }
}

function buildSession(record: SessionRecord, events: TelemetryEvent[]): Session {
  const summary = computeSessionSummary(record, events)

  if (record.status !== 'ended') {
    return {
      record: applyRiskToRecord(record, null),
      events,
      summary,
      riskReport: null,
    }
  }

  const scenario = getScenarioById(record.scenarioId)
  if (!scenario) {
    return {
      record: applyRiskToRecord(record, null),
      events,
      summary,
      riskReport: null,
    }
  }

  const assessment = evaluateRisk({ events, summary, scenario, record })
  const riskReport = buildSessionRiskReport(record, scenario, assessment)
  return applyRiskToSession({ record, events, summary, riskReport: null }, assessment, riskReport)
}

function appendEvent(session: Session, event: TelemetryEvent): Session {
  return buildSession(session.record, [...session.events, event])
}

export const useSessionStore = create<SessionStoreState>((set, get) => {
  const hydrated = loadPersistedSessionState()

  const persistSnapshot = (
    sessions: Record<string, Session>,
    selectedProfileId: ProfileId,
  ) => {
    savePersistedSessionState({
      sessions,
      selectedProfileId,
    })
  }

  const internalEndSession = (
    sessionId: string,
    screenId: string,
    meta?: Record<string, unknown>,
  ) => {
    const state = get()
    const session = state.sessions[sessionId]
    if (!session || session.record.status === 'ended') return

    const now = Date.now()
    const exitEvent: TelemetryEvent = {
      id: createEventId(),
      sessionId,
      scenarioId: session.record.scenarioId,
      simulatorType: session.record.simulatorType,
      profileId: session.record.profileId,
      screenId,
      eventType: 'scenario_exit',
      timestamp: now,
      meta,
    }

    const record: SessionRecord = {
      ...session.record,
      status: 'ended',
      endedAt: now,
      outcome: sessionOutcomeFromExitMeta(meta),
    }
    const updated = buildSession(record, [...session.events, exitEvent])

    const sessions = { ...state.sessions, [sessionId]: updated }
    set({
      sessions,
      activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    })
    persistSnapshot(sessions, state.selectedProfileId)
    archiveEndedSessionInBackground(updated)
  }

  return {
    sessions: hydrated.sessions,
    activeSessionId: null,
    selectedProfileId: hydrated.selectedProfileId,

    startSession: (scenarioId, profileId, simulatorType) => {
      const state = get()
      const now = Date.now()

      if (state.activeSessionId) {
        const active = state.sessions[state.activeSessionId]
        if (active?.record.status === 'active') {
          internalEndSession(state.activeSessionId, SCREEN_IDS.scenarioHub, {
            reason: 'replaced_by_new_session',
          })
        } else if (active?.record.status === 'ended') {
          set({ activeSessionId: null })
        }
      }

      const sessionId = createSessionId()
      const record = activeRecordBase({
        sessionId,
        scenarioId,
        profileId,
        simulatorType,
        startedAt: now,
      })

      const startEvent: TelemetryEvent = {
        id: createEventId(),
        sessionId,
        scenarioId,
        simulatorType,
        profileId,
        screenId: SCREEN_IDS.scenarioHub,
        eventType: 'scenario_start',
        timestamp: now,
        meta: { source: 'scenario_hub' },
      }

      const session = buildSession(record, [startEvent])

      const sessions = { ...get().sessions, [sessionId]: session }
      set({
        sessions,
        activeSessionId: sessionId,
        selectedProfileId: profileId,
      })
      persistSnapshot(sessions, profileId)

      return sessionId
    },

    clearActiveSession: () => {
      const { activeSessionId, sessions } = get()
      if (!activeSessionId) return
      const session = sessions[activeSessionId]
      if (session?.record.status === 'active') return
      set({ activeSessionId: null })
    },

    endSession: (input: EndSessionInput) => {
      const state = get()
      const sessionId = input.sessionId ?? state.activeSessionId
      if (!sessionId) return
      internalEndSession(sessionId, input.screenId, input.meta ?? { reason: 'user_exit' })
    },

    logEvent: (input: LogEventInput) => {
      const state = get()
      const sessionId = state.activeSessionId
      if (!sessionId) return null

      const session = state.sessions[sessionId]
      if (!session || session.record.status !== 'active') return null

      const event: TelemetryEvent = {
        id: createEventId(),
        sessionId,
        scenarioId: session.record.scenarioId,
        simulatorType: session.record.simulatorType,
        profileId: session.record.profileId,
        screenId: input.screenId,
        eventType: input.eventType,
        timestamp: Date.now(),
        meta: input.meta,
      }

      const updated = appendEvent(session, event)
      const sessions = { ...state.sessions, [sessionId]: updated }
      set({ sessions })
      persistSnapshot(sessions, state.selectedProfileId)
      return event
    },

    setSelectedProfileId: (profileId) => {
      set({ selectedProfileId: profileId })
      persistSnapshot(get().sessions, profileId)
    },

    getActiveSession: () => {
      const { activeSessionId, sessions } = get()
      if (!activeSessionId) return null
      const session = sessions[activeSessionId]
      if (!session) return null
      if (session.record.status === 'active') {
        return buildSession(session.record, session.events)
      }
      return session
    },

    getSession: (sessionId) => get().sessions[sessionId] ?? null,
  }
})
