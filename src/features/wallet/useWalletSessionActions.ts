import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, type WalletScreenId } from '../../config'
import { useSessionStore } from '../telemetry/sessionStore'
import type { FlowResultType } from '../../types/contracts'
import { sessionOutcomeFromFlowResult } from '../telemetry/sessionOutcomeFromMeta'

export function useWalletSessionActions() {
  const navigate = useNavigate()
  const endSession = useSessionStore((s) => s.endSession)

  const exitToHub = useCallback(
    (screenId: WalletScreenId) => {
      endSession({
        screenId,
        meta: { reason: 'back_to_hub', outcome: 'abandoned' },
      })
      navigate(ROUTES.scenarios)
    },
    [endSession, navigate],
  )

  const finishScenario = useCallback(
    (screenId: WalletScreenId, resultType: FlowResultType) => {
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
