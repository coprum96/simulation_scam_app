import type { Session } from '../../types/contracts'
import { isValidArchivedSession } from './validateArchivedSession'

function hasValidAssessment(session: Session): boolean {
  const assessment = session.riskReport?.assessment
  return assessment != null && typeof assessment === 'object'
}

/** Drops partial riskReport and other fields that break analytics renderers. */
export function normalizeSessionForAnalytics(session: Session): Session | null {
  if (!isValidArchivedSession(session)) return null

  const riskReport = hasValidAssessment(session) ? session.riskReport : null
  if (riskReport === session.riskReport) return session

  return { ...session, riskReport }
}

export function normalizeSessionsForAnalytics(sessions: Session[]): Session[] {
  const normalized: Session[] = []
  for (const session of sessions) {
    const next = normalizeSessionForAnalytics(session)
    if (next) normalized.push(next)
  }
  return normalized
}
