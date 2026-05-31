/**
 * Phase 4A.1 session archive checks. Run: npm run check:phase4a1
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EMPTY_RISK_ASSESSMENT } from '../src/types/risk'
import type { Session } from '../src/types/contracts'
import { mergeAnalyticsSessionSources } from '../src/features/session-archive/mergeAnalyticsSessions'
import { parseArchiveImportItems } from '../server/sessionArchiveStore.mjs'
import { isValidArchivedSession } from '../src/features/session-archive/validateArchivedSession'
import { buildEndedLocalSessionKey } from '../src/features/session-archive/endedLocalSessionKey'

const REGISTRY_PORT = Number(process.env.REGISTRY_PORT ?? 3001)
const BASE = `http://127.0.0.1:${REGISTRY_PORT}`

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function makeEndedSession(sessionId: string): Session {
  const now = Date.now()
  return {
    record: {
      sessionId,
      scenarioId: 'scenario_a',
      profileId: 'normal_user',
      simulatorType: 'banking',
      startedAt: now - 30_000,
      endedAt: now,
      status: 'ended',
      outcome: 'completed',
      riskScore: 25,
      riskLevel: 'low',
      riskFlags: [],
    },
    events: [
      {
        id: 'evt_1',
        sessionId,
        scenarioId: 'scenario_a',
        simulatorType: 'banking',
        profileId: 'normal_user',
        screenId: 'hub',
        eventType: 'scenario_exit',
        timestamp: now,
        meta: { reason: 'scenario_finished' },
      },
    ],
    summary: {
      sessionId,
      scenarioId: 'scenario_a',
      profileId: 'normal_user',
      status: 'ended',
      startedAt: now - 30_000,
      endedAt: now,
      totalDurationMs: 30_000,
      screensVisited: 2,
      totalEvents: 2,
      eventCounts: {
        scenario_start: 1,
        screen_view: 0,
        button_click: 0,
        scenario_exit: 1,
        input_change: 0,
        warning_view: 0,
        warning_dismiss: 0,
        confirm: 0,
        cancel: 0,
        signature_approve: 0,
        signature_reject: 0,
        recovery_input: 0,
      },
      warningsSeen: 0,
      warningsIgnored: 0,
      fieldEditCount: 0,
      backNavigationCount: 0,
      confirmationDelayMs: null,
      riskScore: 25,
      riskLevel: 'low',
      riskFlags: [],
    },
    riskReport: {
      sessionId,
      scenarioId: 'scenario_a',
      simulatorType: 'banking',
      catalogRiskLevel: 'low',
      expectedRiskFlags: [],
      missedExpectedFlags: [],
      unexpectedFlags: [],
      assessment: { ...EMPTY_RISK_ASSESSMENT, riskScore: 25, riskLevel: 'low' },
      evaluatedAt: now,
    },
  }
}

async function archiveRequest(pathname: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  return { status: response.status, body }
}

async function testArchiveApi(): Promise<void> {
  const session = makeEndedSession('phase4a1_test_session')
  const payload = {
    record: session.record,
    events: session.events,
    summary: session.summary,
    riskReport: session.riskReport,
  }

  const append = await archiveRequest('/api/archive/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  assert(append.status === 200, `append status ${append.status}`)

  const getOne = await archiveRequest(`/api/archive/sessions/${session.record.sessionId}`)
  assert(getOne.status === 200, 'get by id')
  assert(getOne.body.session.record.sessionId === session.record.sessionId, 'session id match')

  const list = await archiveRequest('/api/archive/sessions?scenarioId=scenario_a')
  assert(list.status === 200, 'list')
  assert(list.body.total >= 1, 'list total')

  const listFull = await archiveRequest('/api/archive/sessions?full=1&limit=50')
  assert(listFull.status === 200, 'list full')
  assert(Array.isArray(listFull.body.sessions), 'full sessions array')
  assert(listFull.body.sessions.some((r: { session: Session }) => r.session.record.sessionId === session.record.sessionId), 'full contains session')

  const status = await archiveRequest('/api/archive/status')
  assert(status.status === 200, 'status')
  assert(status.body.sessionCount >= 1, 'status count')

  const bulkImport = await archiveRequest('/api/archive/sessions/import', {
    method: 'POST',
    body: JSON.stringify({ sessions: [payload] }),
  })
  assert(bulkImport.status === 200, 'bulk import wrapper')
  assert(bulkImport.body.imported >= 1, 'bulk imported')

  const singleImport = await archiveRequest('/api/archive/sessions/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  assert(singleImport.status === 200, 'single session import')
}

function testParseImportItems(): void {
  const session = makeEndedSession('import_one')
  const payload = {
    record: session.record,
    events: session.events,
    summary: session.summary,
    riskReport: session.riskReport,
  }
  assert(parseArchiveImportItems([payload]).length === 1, 'array import')
  assert(parseArchiveImportItems({ sessions: [payload] }).length === 1, 'wrapper import')
  assert(parseArchiveImportItems(payload).length === 1, 'single export payload')
  assert(parseArchiveImportItems(null).length === 0, 'null import')
}

function testValidation(): void {
  const valid = makeEndedSession('valid_sess')
  assert(isValidArchivedSession(valid), 'valid ended session')
  const active = { ...valid, record: { ...valid.record, status: 'active' as const } }
  assert(!isValidArchivedSession(active), 'reject active')
  assert(!isValidArchivedSession({ record: {} }), 'reject garbage')
}

function testEndedLocalKey(): void {
  const a = makeEndedSession('a')
  const b = makeEndedSession('b')
  const key1 = buildEndedLocalSessionKey({ a })
  const key2 = buildEndedLocalSessionKey({ a, b })
  assert(key1 !== key2, 'key changes when ended set grows')
  assert(buildEndedLocalSessionKey({ a }) === key1, 'key stable for same set')
}

function testMerge(): void {
  const local = { local_sess: makeEndedSession('local_sess') }
  const archived = [makeEndedSession('archived_sess')]
  const merged = mergeAnalyticsSessionSources(local, archived)
  assert(merged.local_sess != null, 'local present')
  assert(merged.archived_sess != null, 'archived present')

  const override = makeEndedSession('archived_sess')
  override.record.riskScore = 99
  const merged2 = mergeAnalyticsSessionSources(
    { archived_sess: override },
    [makeEndedSession('archived_sess')],
  )
  assert(merged2.archived_sess.record.riskScore === 99, 'local overrides archive')

  const corrupt = makeEndedSession('bad')
  const broken = { ...corrupt, events: null } as unknown as Session
  const merged3 = mergeAnalyticsSessionSources({ bad: broken }, [corrupt])
  assert(merged3.bad?.record.sessionId === 'bad', 'invalid local skipped; archive kept')
}

async function testArchiveFileShape(): Promise<void> {
  const archivePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../server/data/session-archive.json',
  )
  const raw = await fs.readFile(archivePath, 'utf8')
  const parsed = JSON.parse(raw)
  assert(parsed.schemaVersion === 1, 'file schemaVersion')
  assert(typeof parsed.sessions === 'object', 'file sessions map')
}

async function main(): Promise<void> {
  testParseImportItems()
  testValidation()
  testEndedLocalKey()
  testMerge()
  await testArchiveFileShape()
  await testArchiveApi()
  console.log('Phase 4A.1 stabilization checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
