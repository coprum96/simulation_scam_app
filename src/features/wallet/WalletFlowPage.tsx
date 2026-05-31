import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../config'
import { screenIdForWalletStep } from './walletStepConfig'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { useWalletFlow } from './useWalletFlow'
import { useWalletFlowActions } from './useWalletFlowActions'
import { useWalletSessionActions } from './useWalletSessionActions'
import { renderWalletStep } from './walletStepRegistry'

export function WalletFlowPage() {
  const { scenarioId = '' } = useParams()
  const navigate = useNavigate()
  const { scenario, sessionValid, currentStep, stepIndex, navigation, resetFlow } =
    useWalletFlow(scenarioId)
  const flow = useWalletFlowActions(navigation)
  const { exitToHub } = useWalletSessionActions()

  const handleExitToHub = () => {
    if (currentStep) {
      exitToHub(screenIdForWalletStep(currentStep))
    } else {
      navigate(ROUTES.scenarios)
    }
    resetFlow()
  }

  if (!scenario || scenario.simulatorType !== 'wallet') {
    return (
      <div>
        <PageHeader title={ru.screens.wallet} description={ru.errors.scenarioNotFound} />
        <Button variant="secondary" onClick={() => navigate(ROUTES.scenarios)}>
          {ru.buttons.backToScenarios}
        </Button>
      </div>
    )
  }

  if (!sessionValid) {
    return (
      <div>
        <PageHeader title={ru.screens.wallet} description={ru.errors.sessionNotFound} />
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
      {renderWalletStep({
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
