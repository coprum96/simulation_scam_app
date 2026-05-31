import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import { useWalletSessionActions } from '../useWalletSessionActions'

type ResultScreenProps = {
  onFinished: () => void
}

export function ResultScreen({ onFinished }: ResultScreenProps) {
  const { logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.result)
  const resultType = useWalletFlowStore((s) => s.resultType) ?? 'confirmed'
  const { finishScenario } = useWalletSessionActions()

  const isConfirmed = resultType === 'confirmed'
  const title = isConfirmed ? ru.wallet.results.confirmed : ru.wallet.results.cancelled

  const handleFinish = () => {
    logButtonClick('finish_scenario')
    finishScenario(WALLET_SCREEN_IDS.result, resultType)
    onFinished()
  }

  return (
    <WalletStepLayout stepId="result">
      <Card className="mb-4">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{ru.wallet.results.scenarioDone}</p>
      </Card>
      <Button className="w-full" onClick={handleFinish}>
        {ru.buttons.finishScenario}
      </Button>
    </WalletStepLayout>
  )
}
