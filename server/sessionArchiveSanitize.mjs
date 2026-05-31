function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isEndedRecord(record) {
  return (
    isObject(record) &&
    typeof record.sessionId === 'string' &&
    typeof record.scenarioId === 'string' &&
    record.status === 'ended'
  )
}

/** @param {unknown} entry */
export function sanitizeArchiveEntry(entry) {
  if (!isObject(entry)) return null
  if (!isEndedRecord(entry.record)) return null
  if (!Array.isArray(entry.events)) return null
  if (!isObject(entry.summary)) return null

  const sessionId = entry.record.sessionId
  return {
    sessionId,
    archivedAt:
      typeof entry.archivedAt === 'string' ? entry.archivedAt : new Date().toISOString(),
    record: entry.record,
    events: entry.events,
    summary: entry.summary,
    riskReport: entry.riskReport ?? null,
  }
}

/** @param {unknown} store */
export function sanitizeArchiveStore(store) {
  const sessions = {}
  if (isObject(store?.sessions)) {
    for (const value of Object.values(store.sessions)) {
      const entry = sanitizeArchiveEntry(value)
      if (entry) sessions[entry.sessionId] = entry
    }
  }
  return {
    schemaVersion: 1,
    sessions,
  }
}
