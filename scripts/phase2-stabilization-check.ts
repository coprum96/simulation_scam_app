/**
 * Phase 2 stabilization checks. Run: npx tsx scripts/phase2-stabilization-check.ts
 */
import { computeComparativeAnalytics } from '../src/features/analytics/sessionComparativeAnalytics'
import { buildFlatSessionDatasets } from '../src/features/export/flatSessionDatasets'
import { RESEARCH_EXPORT_SCHEMA } from '../src/features/export/exportSchema'
import { toCsv } from '../src/features/export/downloadCsv'
import { sessionOutcomeFromExitMeta } from '../src/features/telemetry/sessionOutcomeFromMeta'
import {
  SESSION_PERSISTENCE_SCHEMA_VERSION,
  loadPersistedSessionState,
  savePersistedSessionState,
} from '../src/features/telemetry/sessionPersistence'
import type { Session } from '../src/types/contracts'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function makeEndedSession(overrides: Partial<Session> & { sessionId?: string } = {}): Session {
  const sessionId = overrides.record?.sessionId ?? overrides.sessionId ?? 'sess_test_1'
  const record = {
    sessionId,
    scenarioId: 'banking_safe_transfer',
    profileId: 'profile_student',
    simulatorType: 'banking' as const,
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_060_000,
    status: 'ended' as const,
    outcome: 'completed' as const,
    riskScore: 25,
    riskLevel: 'medium' as const,
    riskFlags: ['ignored_warning'],
    ...overrides.record,
  }
  const summary = {
    sessionId,
    scenarioId: record.scenarioId,
    profileId: record.profileId,
    status: 'ended' as const,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    totalDurationMs: 60_000,
    screensVisited: 4,
    totalEvents: 8,
    eventCounts: {} as Session['summary']['eventCounts'],
    warningsSeen: 1,
    warningsIgnored: 1,
    fieldEditCount: 0,
    backNavigationCount: 0,
    confirmationDelayMs: 1200,
    riskScore: record.riskScore ?? 25,
    riskLevel: record.riskLevel ?? 'medium',
    riskFlags: record.riskFlags ?? ['ignored_warning'],
    ...overrides.summary,
  }
  const events = overrides.events ?? [
    {
      id: 'evt_1',
      sessionId,
      scenarioId: record.scenarioId,
      simulatorType: record.simulatorType,
      profileId: record.profileId,
      screenId: 'banking_warning',
      eventType: 'warning_dismiss' as const,
      timestamp: record.startedAt + 1000,
      meta: { dismissType: 'continued', warningKeys: ['new_payee'] },
    },
    {
      id: 'evt_2',
      sessionId,
      scenarioId: record.scenarioId,
      simulatorType: record.simulatorType,
      profileId: record.profileId,
      screenId: 'banking_confirm',
      eventType: 'scenario_exit' as const,
      timestamp: record.endedAt!,
      meta: { reason: 'scenario_finished', outcome: 'completed', resultType: 'confirmed' },
    },
  ]
  const riskReport = overrides.riskReport ?? {
    sessionId,
    scenarioId: record.scenarioId,
    expectedRiskFlags: ['ignored_warning'],
    missedExpectedFlags: [],
    unexpectedFlags: [],
    assessment: {
      riskScore: record.riskScore!,
      riskLevel: record.riskLevel!,
      riskFlags: record.riskFlags!,
      ruleHits: [],
    },
  }
  return { record, events, summary, riskReport }
}

function testOutcomes(): void {
  assert(sessionOutcomeFromExitMeta({ reason: 'user_exit' }) === 'abandoned', 'user_exit')
  assert(sessionOutcomeFromExitMeta({ reason: 'back_to_hub' }) === 'abandoned', 'back_to_hub')
  assert(sessionOutcomeFromExitMeta({ resultType: 'confirmed' }) === 'completed', 'confirmed')
}

function testAnalyticsAndCsv(): void {
  const empty = computeComparativeAnalytics([])
  assert(empty.outcomes.completed === 0, 'empty completed')
  assert(empty.averages.riskScore === 0, 'empty avg risk')

  const s1 = makeEndedSession({ sessionId: 's1' })
  const s2 = makeEndedSession({
    sessionId: 's2',
    record: {
      sessionId: 's2',
      scenarioId: 'banking_safe_transfer',
      profileId: 'profile_student',
      simulatorType: 'banking',
      startedAt: 1_700_000_000_000,
      endedAt: 1_700_000_030_000,
      status: 'ended',
      outcome: 'abandoned',
      riskScore: 10,
      riskLevel: 'low',
      riskFlags: [],
    },
    events: [
      {
        id: 'evt_a',
        sessionId: 's2',
        scenarioId: 'banking_safe_transfer',
        simulatorType: 'banking',
        profileId: 'profile_student',
        screenId: 'banking_amount',
        eventType: 'scenario_exit',
        timestamp: 1_700_000_030_000,
        meta: { reason: 'user_exit' },
      },
    ],
  })
  const multi = computeComparativeAnalytics([s1, s2])
  assert(multi.outcomes.completed === 1, 'multi completed')
  assert(multi.outcomes.abandoned === 1, 'multi abandoned')
  assert(multi.patterns.mostCommonAbandonPoints[0]?.key === 'banking_amount', 'abandon point')

  const metadata = {
    schemaName: RESEARCH_EXPORT_SCHEMA.name,
    schemaVersion: RESEARCH_EXPORT_SCHEMA.version,
    exportedAt: new Date().toISOString(),
  }
  const flat = buildFlatSessionDatasets([s1], metadata)
  assert(flat.sessionLevel[0].schemaVersion === 1, 'schemaVersion in row')
  assert(flat.sessionLevel[0].totalEvents === s1.summary.totalEvents, 'totalEvents')
  assert(flat.riskLevel[0].riskScore === s1.record.riskScore, 'riskScore')
  const csvText = toCsv(flat.sessionLevel)
  assert(csvText.startsWith('schemaName,'), 'csv headers')
  assert(csvText.includes(',1,'), 'schema version column')
}

function testPersistenceWithMockStorage(): void {
  const store = new Map<string, string>()
  const originalWindow = globalThis.window
  const originalStorage = globalThis.localStorage
  Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true })
  const mock = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: mock, configurable: true })

  try {
    const session = makeEndedSession({ sessionId: 'persist_1' })
    savePersistedSessionState({
      selectedProfileId: 'profile_student',
      sessions: { persist_1: session },
    })

    const loaded = loadPersistedSessionState()
    assert(loaded.sessions.persist_1?.record.sessionId === 'persist_1', 'reload session')

    store.set('scam_app_ru.sessions.v1', '{not json')
    const corrupt = loadPersistedSessionState()
    assert(Object.keys(corrupt.sessions).length === 0, 'corrupt -> empty')

    store.set(
      'scam_app_ru.sessions.v1',
      JSON.stringify({
        schemaVersion: String(SESSION_PERSISTENCE_SCHEMA_VERSION),
        sessions: [session],
        selectedProfileId: 'profile_student',
      }),
    )
    const stringVersion = loadPersistedSessionState()
    assert(stringVersion.sessions.persist_1?.record.sessionId === 'persist_1', 'string schemaVersion loads')

    store.set(
      'scam_app_ru.sessions.v1',
      JSON.stringify({ schemaVersion: 99, sessions: [], selectedProfileId: 'x' }),
    )
    const mismatch = loadPersistedSessionState()
    assert(Object.keys(mismatch.sessions).length === 0, 'schema mismatch -> empty')
    assert(mismatch.selectedProfileId === 'profile_student' || mismatch.selectedProfileId, 'profile fallback')

    store.set(
      'scam_app_ru.sessions.v1',
      JSON.stringify({
        schemaVersion: SESSION_PERSISTENCE_SCHEMA_VERSION,
        sessions: [session, { record: { sessionId: 'bad' }, events: 'x' }],
        selectedProfileId: 'profile_student',
      }),
    )
    const partial = loadPersistedSessionState()
    assert(Object.keys(partial.sessions).length === 1, 'invalid session dropped')
  } finally {
    if (originalStorage) {
      Object.defineProperty(globalThis, 'localStorage', { value: originalStorage, configurable: true })
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage')
    }
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true })
    } else {
      Reflect.deleteProperty(globalThis, 'window')
    }
  }
}

testOutcomes()
testAnalyticsAndCsv()
testPersistenceWithMockStorage()
console.log('All Phase 2 stabilization checks passed.')
