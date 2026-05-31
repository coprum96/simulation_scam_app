import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { ReviewDetailsCard } from '../components/ReviewDetailsCard'
import { useBankingScreen } from '../useBankingScreen'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type ReviewScreenProps = {
  navigation: BankingNavigation
  flow: BankingFlowActions
}

export function ReviewScreen({ navigation, flow }: ReviewScreenProps) {
  const { logButtonClick, logEvent } = useBankingScreen(BANKING_SCREEN_IDS.review)
  const { canGoBack, goBack } = navigation

  const handleCancel = () => {
    logEvent({ eventType: 'cancel', meta: { action: 'transfer_cancelled' } })
    flow.goToResult('cancelled')
  }

  return (
    <BankingStepLayout stepId="review" canGoBack={canGoBack} onBack={goBack}>
      <ReviewDetailsCard />
      <div className="mt-4 flex flex-col gap-2">
        <Button
          onClick={() => {
            logButtonClick('continue_from_review')
            flow.goNext()
          }}
        >
          {ru.buttons.continue}
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          {ru.buttons.cancelOperation}
        </Button>
      </div>
    </BankingStepLayout>
  )
}
