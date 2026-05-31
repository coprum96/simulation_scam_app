import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { useBankingFlowStore } from '../bankingFlowStore'
import { useBankingScreen } from '../useBankingScreen'
import { useBankingSessionActions } from '../useBankingSessionActions'

type ResultScreenProps = {
  onFinished: () => void
}

export function ResultScreen({ onFinished }: ResultScreenProps) {
  const { logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.result)
  const resultType = useBankingFlowStore((s) => s.resultType) ?? 'confirmed'
  const { finishScenario } = useBankingSessionActions()

  const isConfirmed = resultType === 'confirmed'
  const title = isConfirmed ? ru.banking.results.confirmed : ru.banking.results.cancelled

  const handleFinish = () => {
    logButtonClick('finish_scenario')
    finishScenario(BANKING_SCREEN_IDS.result, resultType)
    onFinished()
  }

  return (
    <BankingStepLayout stepId="result">
      <Card className="mb-4">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{ru.banking.results.scenarioDone}</p>
      </Card>
      <Button className="w-full" onClick={handleFinish}>
        {ru.buttons.finishScenario}
      </Button>
    </BankingStepLayout>
  )
}
