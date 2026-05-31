import {
  archiveEntryToSession,
  archiveListRow,
  getSessionArchiveFilePath,
  importArchiveSessions,
  listArchiveEntries,
  parseArchiveImportItems,
  readSessionArchiveStore,
  upsertArchiveSession,
  writeSessionArchiveStore,
} from './sessionArchiveStore.mjs'

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return null
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text.trim()) return null
  return JSON.parse(text)
}

function parseDateMs(dateStr) {
  if (!dateStr || !String(dateStr).trim()) return null
  const fromMs = new Date(`${String(dateStr).trim()}T00:00:00`).getTime()
  return Number.isFinite(fromMs) ? fromMs : null
}

function parseDateEndMs(dateStr) {
  if (!dateStr || !String(dateStr).trim()) return null
  const toMs = new Date(`${String(dateStr).trim()}T23:59:59.999`).getTime()
  return Number.isFinite(toMs) ? toMs : null
}

function listFiltersFromUrl(url) {
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam != null ? Number(limitParam) : 500
  return {
    scenarioId: url.searchParams.get('scenarioId') || undefined,
    simulatorType: url.searchParams.get('simulatorType') || undefined,
    profileId: url.searchParams.get('profileId') || undefined,
    outcome: url.searchParams.get('outcome') || undefined,
    riskLevel: url.searchParams.get('riskLevel') || undefined,
    dateFromMs: parseDateMs(url.searchParams.get('dateFrom')),
    dateToMs: parseDateEndMs(url.searchParams.get('dateTo')),
    limit: Number.isFinite(limit) ? limit : 500,
  }
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {URL} url
 * @param {(res: import('node:http').ServerResponse, status: number, body: unknown) => void} json
 * @returns {Promise<boolean>}
 */
export async function handleSessionArchiveRoutes(req, res, url, json) {
  const { pathname } = url

  if (req.method === 'GET' && pathname === '/api/archive/status') {
    const store = await readSessionArchiveStore()
    json(res, 200, {
      schemaVersion: 1,
      storagePath: getSessionArchiveFilePath(),
      sessionCount: Object.keys(store.sessions).length,
    })
    return true
  }

  const sessionIdMatch = pathname.match(/^\/api\/archive\/sessions\/([^/]+)$/)
  if (req.method === 'GET' && sessionIdMatch) {
    const sessionId = decodeURIComponent(sessionIdMatch[1])
    const store = await readSessionArchiveStore()
    const entry = store.sessions[sessionId]
    if (!entry) {
      json(res, 404, { error: 'not_found' })
      return true
    }
    json(res, 200, {
      schemaVersion: 1,
      archivedAt: entry.archivedAt,
      session: archiveEntryToSession(entry),
    })
    return true
  }

  if (req.method === 'GET' && pathname === '/api/archive/sessions') {
    const store = await readSessionArchiveStore()
    const filters = listFiltersFromUrl(url)
    const includeFull = url.searchParams.get('full') === '1'
    const { entries, total } = listArchiveEntries(store, filters)

    if (includeFull) {
      json(res, 200, {
        schemaVersion: 1,
        total,
        sessions: entries.map((entry) => ({
          archivedAt: entry.archivedAt,
          session: archiveEntryToSession(entry),
        })),
      })
      return true
    }

    json(res, 200, {
      schemaVersion: 1,
      total,
      sessions: entries.map(archiveListRow),
    })
    return true
  }

  if (req.method === 'POST' && pathname === '/api/archive/sessions/import') {
    const body = await readBody(req)
    const store = await readSessionArchiveStore()
    const items = parseArchiveImportItems(body)
    const result = importArchiveSessions(store, items)
    await writeSessionArchiveStore(store)
    json(res, 200, {
      schemaVersion: 1,
      ...result,
      sessionCount: Object.keys(store.sessions).length,
    })
    return true
  }

  if (req.method === 'POST' && pathname === '/api/archive/sessions') {
    const body = await readBody(req)
    const store = await readSessionArchiveStore()
    const result = upsertArchiveSession(store, body)
    if (!result.ok) {
      json(res, 400, { error: result.error })
      return true
    }
    await writeSessionArchiveStore(store)
    json(res, 200, {
      schemaVersion: 1,
      archivedAt: result.entry.archivedAt,
      sessionId: result.entry.sessionId,
    })
    return true
  }

  return false
}
