import type { Session } from '../../types/contracts'
import { fetchArchivedSessionsFull } from './archiveApi'
import { buildEndedLocalSessionKey } from './endedLocalSessionKey'
import { syncLocalEndedSessionsToArchive } from './syncLocalSessionsToArchive'
import { toArchivedSessionMap } from './toArchivedSessionMap'

export type AnalyticsArchiveLoadState = {
  archivedMap: Record<string, Session>
  ready: boolean
  error: boolean
}

const emptyState: AnalyticsArchiveLoadState = {
  archivedMap: {},
  ready: false,
  error: false,
}

let cache: AnalyticsArchiveLoadState = { ...emptyState }
let cacheEndedKey = ''
let inflight: Promise<AnalyticsArchiveLoadState> | null = null
let inflightEndedKey = ''

export function getCachedAnalyticsArchive(endedKey: string): AnalyticsArchiveLoadState | null {
  if (cache.ready && cacheEndedKey === endedKey) return cache
  return null
}

export function loadAnalyticsArchive(
  localSessions: Record<string, Session>,
): Promise<AnalyticsArchiveLoadState> {
  const endedKey = buildEndedLocalSessionKey(localSessions)

  const hit = getCachedAnalyticsArchive(endedKey)
  if (hit) return Promise.resolve(hit)

  if (inflight && inflightEndedKey === endedKey) return inflight

  inflightEndedKey = endedKey
  const keepPreviousMap = cache.ready && cacheEndedKey === endedKey

  inflight = (async () => {
    try {
      await syncLocalEndedSessionsToArchive(localSessions)
      const sessions = await fetchArchivedSessionsFull({ limit: 2000 })
      cache = {
        archivedMap: toArchivedSessionMap(sessions),
        ready: true,
        error: false,
      }
      cacheEndedKey = endedKey
    } catch {
      cache = {
        archivedMap: keepPreviousMap ? cache.archivedMap : {},
        ready: true,
        error: true,
      }
      cacheEndedKey = endedKey
    } finally {
      inflight = null
      inflightEndedKey = ''
    }
    return cache
  })()

  return inflight
}

/** Test-only reset */
export function resetAnalyticsArchiveLoaderCache(): void {
  cache = { ...emptyState }
  cacheEndedKey = ''
  inflight = null
  inflightEndedKey = ''
}
