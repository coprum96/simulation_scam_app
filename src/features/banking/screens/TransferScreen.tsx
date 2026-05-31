import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { RecipientFormFields } from '../components/RecipientFormFields'
import { useBankingScreen } from '../useBankingScreen'
import { nextStepId } from '../bankingStepConfig'
import { isTransferFormComplete } from '../bankingFlowLogic'
import { useBankingFlowStore } from '../bankingFlowStore'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type TransferScreenProps = {
  navigation: BankingNavigation
  flow: BankingFlowActions
  stepIndex: number
}

export function TransferScreen({ navigation, flow, stepIndex }: TransferScreenProps) {
  const { logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.transfer)
  const form = useBankingFlowStore((s) => s.form)
  const { canGoBack, goBack, steps } = navigation
  const next = nextStepId(steps, stepIndex)
  const showInlineForm = next === 'review'

  const handleContinue = () => {
    if (next === 'new_recipient') {
      logButtonClick('to_new_recipient')
      flow.goNext()
      return
    }
    if (next === 'review' && isTransferFormComplete(form)) {
      logButtonClick('continue_to_review')
      flow.goNext()
    }
  }

  return (
    <BankingStepLayout stepId="transfer" canGoBack={canGoBack} onBack={goBack}>
      <Card>
        <p className="font-medium text-slate-900">{ru.banking.transfer.title}</p>
        <p className="mt-1 text-sm text-slate-600">{ru.banking.transfer.hint}</p>
        {next === 'new_recipient' ? (
          <Button className="mt-3 w-full" variant="secondary" onClick={handleContinue}>
            {ru.banking.transfer.toNewRecipient}
          </Button>
        ) : null}
        {showInlineForm ? (
          <>
            <div className="mt-4">
              <RecipientFormFields screenId={BANKING_SCREEN_IDS.transfer} />
            </div>
            <Button
              className="mt-3 w-full"
              onClick={handleContinue}
              disabled={!isTransferFormComplete(form)}
            >
              {ru.buttons.goToReview}
            </Button>
          </>
        ) : null}
      </Card>
    </BankingStepLayout>
  )
}
