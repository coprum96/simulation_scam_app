import { BANKING_FIELD_IDS } from '../../../config/bankingFields'
import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { ReviewDetailsCard } from '../components/ReviewDetailsCard'
import { useBankingScreen } from '../useBankingScreen'
import { useBankingFieldCommit } from '../useBankingFieldCommit'
import { isConfirmationCodeValid } from '../bankingFlowLogic'
import { useBankingFlowStore } from '../bankingFlowStore'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type ConfirmScreenProps = {
  navigation: BankingNavigation
  flow: BankingFlowActions
}

export function ConfirmScreen({ navigation, flow }: ConfirmScreenProps) {
  const { logEvent } = useBankingScreen(BANKING_SCREEN_IDS.confirm)
  const { logFieldCommit } = useBankingFieldCommit(BANKING_SCREEN_IDS.confirm)
  const form = useBankingFlowStore((s) => s.form)
  const setFormField = useBankingFlowStore((s) => s.setFormField)
  const { canGoBack, goBack } = navigation

  const handleConfirm = () => {
    if (!isConfirmationCodeValid(form.confirmationCode)) return
    logEvent({ eventType: 'confirm', meta: { action: 'transfer_confirmed' } })
    flow.goToResult('confirmed')
  }

  const handleCancel = () => {
    logEvent({ eventType: 'cancel', meta: { action: 'transfer_cancelled' } })
    flow.goToResult('cancelled')
  }

  return (
    <BankingStepLayout stepId="confirm" canGoBack={canGoBack} onBack={goBack}>
      <ReviewDetailsCard />
      <Card className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-900">{ru.banking.confirm.title}</p>
        <p className="mb-3 text-sm text-slate-600">{ru.banking.confirm.hint}</p>
        <Field
          label={ru.banking.fields.confirmationCode}
          hint={ru.banking.confirm.demoCodeHint}
          value={form.confirmationCode}
          onChange={(e) => setFormField('confirmationCode', e.target.value)}
          onBlur={() =>
            logFieldCommit(BANKING_FIELD_IDS.confirmationCode, form.confirmationCode)
          }
          maxLength={6}
          inputMode="numeric"
        />
      </Card>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={handleConfirm} disabled={!isConfirmationCodeValid(form.confirmationCode)}>
          {ru.buttons.confirmTransfer}
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          {ru.buttons.cancelOperation}
        </Button>
      </div>
    </BankingStepLayout>
  )
}
