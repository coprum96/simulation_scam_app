import { useNavigate } from 'react-router-dom'
import { bankingPath, walletPath } from '../../config'
import { getScenarioById } from '../../data/scenarios'
import { useSessionStore } from '../telemetry/sessionStore'

export function useScenarioLaunch() {
  const navigate = useNavigate()
  const startSession = useSessionStore((s) => s.startSession)
  const selectedProfileId = useSessionStore((s) => s.selectedProfileId)

  const launchScenario = (scenarioId: string) => {
    const scenario = getScenarioById(scenarioId)
    if (!scenario) return

    if (!scenario.targetProfileIds.includes(selectedProfileId)) {
      return { ok: false as const, reason: 'profile_not_supported' as const }
    }

    startSession(scenario.id, selectedProfileId, scenario.simulatorType)

    const path =
      scenario.simulatorType === 'banking'
        ? bankingPath(scenario.id)
        : walletPath(scenario.id)

    navigate(path)
    return { ok: true as const }
  }

  return { launchScenario, selectedProfileId }
}
