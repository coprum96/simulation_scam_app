import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, type BankingScreenId } from '../../config'
import { useSessionStore } from '../telemetry/sessionStore'
import type { FlowResultType } from '../../types/contracts'
import { sessionOutcomeFromFlowResult } from '../telemetry/sessionOutcomeFromMeta'

/**
 * Единая точка завершения banking-сессии.
 *
 * — endSession() пишет scenario_exit и сбрасывает activeSessionId.
 * — clearActiveSession() только снимает указатель на уже ended-сессию (хаб).
 * Не вызывать оба для одного выхода.
 */
export function useBankingSessionActions() {
  const navigate = useNavigate()
  const endSession = useSessionStore((s) => s.endSession)

  const exitToHub = useCallback(
    (screenId: BankingScreenId) => {
      endSession({
        screenId,
        meta: { reason: 'back_to_hub', outcome: 'abandoned' },
      })
      navigate(ROUTES.scenarios)
    },
    [endSession, navigate],
  )

  const finishScenario = useCallback(
    (screenId: BankingScreenId, resultType: FlowResultType) => {
      endSession({
        screenId,
        meta: {
          reason: 'scenario_finished',
          outcome: sessionOutcomeFromFlowResult(resultType),
          resultType,
        },
      })
      navigate(ROUTES.scenarios)
    },
    [endSession, navigate],
  )

  return { exitToHub, finishScenario }
}
