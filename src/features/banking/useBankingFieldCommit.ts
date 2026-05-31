import { useCallback } from 'react'
import type { BankingFieldId } from '../../config/bankingFields'
import type { BankingScreenId } from '../../config/screens'
import { useSessionStore } from '../telemetry/sessionStore'

/** input_change только при commit (blur), не на каждый символ */
export function useBankingFieldCommit(screenId: BankingScreenId) {
  const logEvent = useSessionStore((s) => s.logEvent)

  const logFieldCommit = useCallback(
    (fieldId: BankingFieldId, value?: string, meta?: Record<string, unknown>) => {
      logEvent({
        eventType: 'input_change',
        screenId,
        meta: { fieldId, commit: true, ...(value !== undefined ? { value } : {}), ...meta },
      })
    },
    [logEvent, screenId],
  )

  return { logFieldCommit }
}
