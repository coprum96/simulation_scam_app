import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sanitizeArchiveEntry, sanitizeArchiveStore } from './sessionArchiveSanitize.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const ARCHIVE_FILE = path.join(DATA_DIR, 'session-archive.json')

const EMPTY_STORE = {
  schemaVersion: 1,
  sessions: {},
}

export function getSessionArchiveFilePath() {
  return ARCHIVE_FILE
}

export async function readSessionArchiveStore() {
  try {
    const raw = await fs.readFile(ARCHIVE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed.schemaVersion !== 1) return structuredClone(EMPTY_STORE)
    return sanitizeArchiveStore(parsed)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return structuredClone(EMPTY_STORE)
    }
    if (error instanceof SyntaxError) {
      console.error('[session-archive] corrupt store file, using empty store')
      return structuredClone(EMPTY_STORE)
    }
    throw error
  }
}

export async function writeSessionArchiveStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const payload = sanitizeArchiveStore(store)
  await fs.writeFile(ARCHIVE_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return payload
}

/** @param {import('./sessionArchiveSanitize.mjs').sanitizeArchiveEntry extends (...args: any) => infer R ? R : never} entry */
export function archiveEntryToSession(entry) {
  return {
    record: entry.record,
    events: entry.events,
    summary: entry.summary,
    riskReport: entry.riskReport ?? null,
  }
}

export function listArchiveEntries(store, filters = {}) {
  let entries = Object.values(store.sessions)

  if (filters.scenarioId) {
    entries = entries.filter((e) => e.record.scenarioId === filters.scenarioId)
  }
  if (filters.simulatorType) {
    entries = entries.filter((e) => e.record.simulatorType === filters.simulatorType)
  }
  if (filters.profileId) {
    entries = entries.filter((e) => e.record.profileId === filters.profileId)
  }
  if (filters.outcome) {
    entries = entries.filter((e) => e.record.outcome === filters.outcome)
  }
  if (filters.riskLevel) {
    const level = filters.riskLevel
    entries = entries.filter((e) => {
      const fromRecord = e.record.riskLevel ?? e.summary?.riskLevel
      return fromRecord === level
    })
  }
  if (filters.dateFromMs != null) {
    entries = entries.filter((e) => (e.record.endedAt ?? 0) >= filters.dateFromMs)
  }
  if (filters.dateToMs != null) {
    entries = entries.filter((e) => (e.record.endedAt ?? 0) <= filters.dateToMs)
  }

  entries.sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))

  const limit =
    filters.limit != null && Number.isFinite(filters.limit) ? Math.max(1, filters.limit) : null
  const total = entries.length
  if (limit != null) entries = entries.slice(0, limit)

  return { entries, total }
}

/** @param {ReturnType<typeof sanitizeArchiveStore>} store @param {unknown} body */
export function upsertArchiveSession(store, body) {
  const entry = sanitizeArchiveEntry({
    sessionId: body?.record?.sessionId ?? body?.sessionId,
    archivedAt: body?.archivedAt ?? new Date().toISOString(),
    record: body?.record,
    events: body?.events,
    summary: body?.summary,
    riskReport: body?.riskReport ?? null,
  })
  if (!entry) return { ok: false, error: 'invalid_session' }

  const existing = store.sessions[entry.sessionId]
  store.sessions[entry.sessionId] = {
    ...entry,
    archivedAt: existing?.archivedAt ?? entry.archivedAt,
  }
  return { ok: true, entry: store.sessions[entry.sessionId] }
}

/** @param {unknown} body */
export function parseArchiveImportItems(body) {
  if (!body) return []
  if (Array.isArray(body)) return body
  if (Array.isArray(body.sessions)) return body.sessions
  if (body.record && typeof body.record === 'object' && typeof body.record.sessionId === 'string') {
    return [body]
  }
  return []
}

/** @param {ReturnType<typeof sanitizeArchiveStore>} store @param {unknown[]} items */
export function importArchiveSessions(store, items) {
  if (!Array.isArray(items)) return { imported: 0, skipped: 0, errors: ['expected_array'] }

  let imported = 0
  let skipped = 0
  const errors = []

  for (const item of items) {
    const result = upsertArchiveSession(store, item)
    if (result.ok) imported += 1
    else {
      skipped += 1
      errors.push(result.error)
    }
  }

  return { imported, skipped, errors: [...new Set(errors)] }
}

export function archiveListRow(entry) {
  const record = entry.record
  const summary = entry.summary
  return {
    sessionId: record.sessionId,
    scenarioId: record.scenarioId,
    profileId: record.profileId,
    simulatorType: record.simulatorType,
    outcome: record.outcome,
    riskScore: record.riskScore ?? summary.riskScore ?? 0,
    riskLevel: record.riskLevel ?? summary.riskLevel ?? 'low',
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    archivedAt: entry.archivedAt,
  }
}
