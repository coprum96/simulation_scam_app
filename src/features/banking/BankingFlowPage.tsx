import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { ROUTES } from '../../config'
import { screenIdForBankingStep } from './bankingStepConfig'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { useBankingFlow } from './useBankingFlow'
import { useBankingFlowActions } from './useBankingFlowActions'
import { useBankingSessionActions } from './useBankingSessionActions'
import { renderBankingStep } from './bankingStepRegistry'

export function BankingFlowPage() {
  const { scenarioId = '' } = useParams()
  const navigate = useNavigate()
  const { scenario, sessionValid, currentStep, stepIndex, navigation, resetFlow } =
    useBankingFlow(scenarioId)
  const flow = useBankingFlowActions(navigation)
  const { exitToHub } = useBankingSessionActions()

  const handleExitToHub = () => {
    if (currentStep) {
      exitToHub(screenIdForBankingStep(currentStep))
    } else {
      navigate(ROUTES.scenarios)
    }
    resetFlow()
  }

  if (!scenario || scenario.simulatorType !== 'banking') {
    return (
      <div>
        <PageHeader title={ru.screens.banking} description={ru.errors.scenarioNotFound} />
        <Button variant="secondary" onClick={() => navigate(ROUTES.scenarios)}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
    )
  }

  if (!sessionValid) {
    return (
      <div>
        <PageHeader title={ru.screens.banking} description={ru.errors.sessionNotFound} />
        <Button variant="secondary" onClick={() => navigate(ROUTES.scenarios)}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
    )
  }

  if (!currentStep) {
    return (
      <div>
        <PageHeader title={scenario.title} description={ru.errors.scenarioNotFound} />
        <Button variant="secondary" onClick={handleExitToHub}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={scenario.title} description={ru.app.disclaimer} />
      <div className="mb-4 flex justify-start sm:justify-end">
        <Button variant="ghost" className="w-full sm:w-auto" onClick={handleExitToHub}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
      {renderBankingStep({
        scenario,
        stepId: currentStep,
        stepIndex,
        navigation,
        flow,
        onFlowFinished: resetFlow,
      })}
    </div>
  )
}
