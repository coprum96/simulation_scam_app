import { useNavigate } from 'react-router-dom'
import { ROUTES, type ScreenId } from '../../config'
import { useSessionStore } from './sessionStore'

type ExitOptions = {
  screenId: ScreenId
  reason?: string
}

export function useScenarioExit() {
  const navigate = useNavigate()
  const endSession = useSessionStore((s) => s.endSession)

  const exitToScenarios = ({ screenId, reason = 'back_to_hub' }: ExitOptions) => {
    endSession({ screenId, meta: { reason } })
    navigate(ROUTES.scenarios)
  }

  return { exitToScenarios }
}
