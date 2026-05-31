import { useEffect, useRef } from 'react'
import type { ScreenId } from '../../config'
import { useSessionStore } from './sessionStore'

/** Логирует screen_view один раз при монтировании экрана (для активной сессии). */
export function useScreenViewOnMount(
  screenId: ScreenId,
  meta?: Record<string, unknown>,
) {
  const logEvent = useSessionStore((s) => s.logEvent)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const loggedRef = useRef(false)

  useEffect(() => {
    if (!activeSessionId) {
      loggedRef.current = false
      return
    }
    if (loggedRef.current) return

    logEvent({ eventType: 'screen_view', screenId, meta })
    loggedRef.current = true
  }, [activeSessionId, screenId, logEvent, meta])
}
