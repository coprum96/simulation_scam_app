import type { Session } from '../../types/contracts'
import type { SessionExportPayload } from '../export/sessionExportPayload'

export const SESSION_ARCHIVE_SCHEMA_VERSION = 1 as const

export type ArchivedSessionEntry = SessionExportPayload & {
  sessionId: string
  archivedAt: string
}

export type ArchivedSessionListRow = {
  sessionId: string
  scenarioId: string
  profileId: string
  simulatorType: string
  outcome: string | null
  riskScore: number
  riskLevel: string
  startedAt: number
  endedAt: number | null
  archivedAt: string
}

export type ArchivedSessionListResponse = {
  schemaVersion: typeof SESSION_ARCHIVE_SCHEMA_VERSION
  total: number
  sessions: ArchivedSessionListRow[]
}

export type ArchivedSessionFullListResponse = {
  schemaVersion: typeof SESSION_ARCHIVE_SCHEMA_VERSION
  total: number
  sessions: Array<{ archivedAt: string; session: Session }>
}

export type ArchivedSessionGetResponse = {
  schemaVersion: typeof SESSION_ARCHIVE_SCHEMA_VERSION
  archivedAt: string
  session: Session
}

export type ArchiveImportResult = {
  schemaVersion: typeof SESSION_ARCHIVE_SCHEMA_VERSION
  imported: number
  skipped: number
  errors: string[]
  sessionCount: number
}

export type ArchiveListQuery = {
  scenarioId?: string
  simulatorType?: string
  profileId?: string
  outcome?: string
  riskLevel?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}
