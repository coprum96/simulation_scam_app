import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import type { SimulatorType } from '../../types/scenario'
import type { ScreenId } from '../../config'
import { getScenarioById } from '../../data/scenarios'
import { useSessionStore } from '../../features/telemetry/sessionStore'
import { ru } from '../../content/ru'
import { PageHeader } from '../layout/PageHeader'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ROUTES } from '../../config'
import { useNavigate } from 'react-router-dom'

type SimulatorStubPageProps = {
  simulatorType: SimulatorType
  screenId: ScreenId
  pageTitle: string
  stubBody: string
}

export function SimulatorStubPage({
  simulatorType,
  screenId,
  pageTitle,
  stubBody,
}: SimulatorStubPageProps) {
  const { scenarioId = '' } = useParams()
  const navigate = useNavigate()
  const scenario = getScenarioById(scenarioId)
  const logEvent = useSessionStore((s) => s.logEvent)
  const endSession = useSessionStore((s) => s.endSession)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const loggedViewRef = useRef(false)

  useEffect(() => {
    if (!activeSessionId || loggedViewRef.current) return
    logEvent({
      eventType: 'screen_view',
      screenId,
      meta: { scenarioId, simulatorType },
    })
    loggedViewRef.current = true
  }, [activeSessionId, logEvent, screenId, scenarioId, simulatorType])

  const handleBack = () => {
    logEvent({
      eventType: 'button_click',
      screenId,
      meta: { buttonId: 'back_to_scenarios' },
    })
    endSession({
      screenId,
      meta: { reason: 'back_to_hub' },
    })
    navigate(ROUTES.scenarios)
  }

  if (!scenario || scenario.simulatorType !== simulatorType) {
    return (
      <div>
        <PageHeader title={pageTitle} description={ru.errors.scenarioNotFound} />
        <Button variant="secondary" onClick={handleBack}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={pageTitle} description={scenario.title} />
      <Card className="mb-4">
        <p className="text-sm text-slate-600">{stubBody}</p>
      </Card>
      <Button variant="secondary" onClick={handleBack}>
        {ru.buttons.backToScenarios}
      </Button>
    </div>
  )
}
