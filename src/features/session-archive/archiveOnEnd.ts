import { toSessionExportPayload } from '../export/sessionExportPayload'
import type { Session } from '../../types/contracts'
import { appendSessionToArchive } from './archiveApi'

export function archiveEndedSessionInBackground(session: Session): void {
  if (session.record.status !== 'ended') return
  void appendSessionToArchive(toSessionExportPayload(session))
}
