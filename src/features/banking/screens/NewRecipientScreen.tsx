import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { RecipientFormFields } from '../components/RecipientFormFields'
import { PhoneInstructionBanner } from '../components/PhoneInstructionBanner'
import { useBankingScreen } from '../useBankingScreen'
import { isTransferFormComplete, shouldShowPhoneInstructionBanner } from '../bankingFlowLogic'
import { useBankingFlowStore } from '../bankingFlowStore'
import type { ScenarioId } from '../../../types/scenario'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type NewRecipientScreenProps = {
  scenarioId: ScenarioId
  navigation: BankingNavigation
  flow: BankingFlowActions
}

export function NewRecipientScreen({ scenarioId, navigation, flow }: NewRecipientScreenProps) {
  const { logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.newRecipient)
  const form = useBankingFlowStore((s) => s.form)
  const { canGoBack, goBack } = navigation

  const handleContinue = () => {
    if (!isTransferFormComplete(form)) return
    logButtonClick('go_to_review')
    flow.goNext()
  }

  return (
    <BankingStepLayout stepId="new_recipient" canGoBack={canGoBack} onBack={goBack}>
      {shouldShowPhoneInstructionBanner(scenarioId) ? <PhoneInstructionBanner /> : null}
      <Card>
        <p className="mb-3 text-sm font-medium text-slate-900">{ru.banking.newRecipient.title}</p>
        <RecipientFormFields screenId={BANKING_SCREEN_IDS.newRecipient} />
        <Button className="mt-2 w-full" onClick={handleContinue} disabled={!isTransferFormComplete(form)}>
          {ru.buttons.goToReview}
        </Button>
      </Card>
    </BankingStepLayout>
  )
}
