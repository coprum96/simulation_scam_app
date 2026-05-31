import { buildSessionsExportPayload } from '../export/exportSessions'
import type { Session } from '../../types/contracts'
import { fetchArchiveStatus, importSessionsToArchive } from './archiveApi'
import { buildEndedLocalSessionKey } from './endedLocalSessionKey'

let lastSyncedEndedKey = ''

export async function syncLocalEndedSessionsToArchive(
  localSessions: Record<string, Session>,
): Promise<void> {
  const endedKey = buildEndedLocalSessionKey(localSessions)
  if (!endedKey || endedKey === lastSyncedEndedKey) return

  const status = await fetchArchiveStatus()
  if (!status) return

  const ended = Object.values(localSessions).filter((s) => s.record.status === 'ended')
  const payloads = buildSessionsExportPayload(ended)
  const result = await importSessionsToArchive(payloads)
  if (result) lastSyncedEndedKey = endedKey
}
