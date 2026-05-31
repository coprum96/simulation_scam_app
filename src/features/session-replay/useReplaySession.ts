import { useEffect, useState } from 'react'
import { useSessionStore } from '../telemetry/sessionStore'
import { fetchArchivedSessionById } from '../session-archive'
import type { Session } from '../../types/contracts'

export function useReplaySession(sessionId: string | undefined) {
  const localSession = useSessionStore((s) =>
    sessionId ? (s.sessions[sessionId] ?? null) : null,
  )
  const [archivedSession, setArchivedSession] = useState<Session | null>(null)
  const [archiveLoading, setArchiveLoading] = useState(false)

  useEffect(() => {
    if (!sessionId || localSession) {
      setArchivedSession(null)
      setArchiveLoading(false)
      return
    }

    let cancelled = false
    setArchiveLoading(true)
    void fetchArchivedSessionById(sessionId)
      .then((session) => {
        if (!cancelled) setArchivedSession(session)
      })
      .finally(() => {
        if (!cancelled) setArchiveLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, localSession])

  const session = localSession ?? archivedSession

  return {
    session,
    source: localSession ? ('local' as const) : archivedSession ? ('archive' as const) : null,
    loading: archiveLoading && !session,
  }
}
