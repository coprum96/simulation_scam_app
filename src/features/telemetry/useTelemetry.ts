import { useCallback } from 'react'
import { useSessionStore } from './sessionStore'
import type { ScreenId } from '../../config'
import type { LogEventInput, TelemetryEvent } from '../../types/telemetry'

export function useTelemetry(screenId: ScreenId) {
  const logEventRaw = useSessionStore((s) => s.logEvent)

  const logEvent = useCallback(
    (input: Omit<LogEventInput, 'screenId'>) =>
      logEventRaw({ ...input, screenId }),
    [logEventRaw, screenId],
  )

  const logScreenView = useCallback(
    (meta?: Record<string, unknown>) =>
      logEventRaw({ eventType: 'screen_view', screenId, meta }),
    [logEventRaw, screenId],
  )

  const logButtonClick = useCallback(
    (buttonId: string, meta?: Record<string, unknown>) =>
      logEventRaw({
        eventType: 'button_click',
        screenId,
        meta: { buttonId, ...meta },
      }),
    [logEventRaw, screenId],
  )

  return {
    logEvent,
    logScreenView,
    logButtonClick,
  }
}

export type { TelemetryEvent }
