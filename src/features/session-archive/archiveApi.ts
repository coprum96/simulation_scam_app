import { REGISTRY_API_BASE } from '../../registry/config'
import type { Session } from '../../types/contracts'
import type { SessionExportPayload } from '../export/sessionExportPayload'
import type {
  ArchiveImportResult,
  ArchiveListQuery,
  ArchivedSessionFullListResponse,
  ArchivedSessionGetResponse,
} from './types'
import { normalizeSessionsForAnalytics, normalizeSessionForAnalytics } from './normalizeSessionForAnalytics'

export class SessionArchiveApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'SessionArchiveApiError'
    this.status = status
  }
}

async function archiveRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${REGISTRY_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore
    }
    throw new SessionArchiveApiError(response.status, message)
  }
  return response.json() as Promise<T>
}

function queryString(query: ArchiveListQuery, extra?: Record<string, string>): string {
  const params = new URLSearchParams()
  if (query.scenarioId) params.set('scenarioId', query.scenarioId)
  if (query.simulatorType) params.set('simulatorType', query.simulatorType)
  if (query.profileId) params.set('profileId', query.profileId)
  if (query.outcome) params.set('outcome', query.outcome)
  if (query.riskLevel) params.set('riskLevel', query.riskLevel)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  if (query.limit != null) params.set('limit', String(query.limit))
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value)
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchArchivedSessionsFull(
  query: ArchiveListQuery = {},
): Promise<Session[]> {
  try {
    const response = await archiveRequest<ArchivedSessionFullListResponse>(
      `/api/archive/sessions${queryString(query, { full: '1' })}`,
    )
    return normalizeSessionsForAnalytics(response.sessions.map((row) => row.session))
  } catch (error) {
    if (error instanceof SessionArchiveApiError && error.status === 404) return []
    throw error
  }
}

export async function fetchArchivedSessionById(sessionId: string): Promise<Session | null> {
  try {
    const response = await archiveRequest<ArchivedSessionGetResponse>(
      `/api/archive/sessions/${encodeURIComponent(sessionId)}`,
    )
    return normalizeSessionForAnalytics(response.session)
  } catch (error) {
    if (error instanceof SessionArchiveApiError && error.status === 404) return null
    throw error
  }
}

export async function appendSessionToArchive(payload: SessionExportPayload): Promise<void> {
  if (payload.record.status !== 'ended') return
  try {
    await archiveRequest<{ sessionId: string }>('/api/archive/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch {
    // Non-blocking: runtime must not fail if archive API is offline.
  }
}

export async function importSessionsToArchive(
  payloads: SessionExportPayload[],
): Promise<ArchiveImportResult | null> {
  try {
    return await archiveRequest<ArchiveImportResult>('/api/archive/sessions/import', {
      method: 'POST',
      body: JSON.stringify(payloads),
    })
  } catch {
    return null
  }
}

export async function fetchArchiveStatus(): Promise<{ sessionCount: number } | null> {
  try {
    const body = await archiveRequest<{ sessionCount: number }>('/api/archive/status')
    return { sessionCount: body.sessionCount }
  } catch {
    return null
  }
}
