import { Field } from '../../../components/ui/Field'
import { ru } from '../../../content/ru'
import { BANKING_FIELD_IDS } from '../../../config/bankingFields'
import type { BankingScreenId } from '../../../config/screens'
import { useBankingFieldCommit } from '../useBankingFieldCommit'
import { useBankingFlowStore } from '../bankingFlowStore'

type RecipientFormFieldsProps = {
  screenId: BankingScreenId
}

export function RecipientFormFields({ screenId }: RecipientFormFieldsProps) {
  const { logFieldCommit } = useBankingFieldCommit(screenId)
  const form = useBankingFlowStore((s) => s.form)
  const setFormField = useBankingFlowStore((s) => s.setFormField)

  return (
    <>
      <Field
        label={ru.banking.fields.recipientName}
        value={form.recipientName}
        onChange={(e) => setFormField('recipientName', e.target.value)}
        onBlur={() => logFieldCommit(BANKING_FIELD_IDS.recipientName, form.recipientName)}
      />
      <Field
        label={ru.banking.fields.recipientBank}
        value={form.recipientBank}
        onChange={(e) => setFormField('recipientBank', e.target.value)}
        onBlur={() => logFieldCommit(BANKING_FIELD_IDS.recipientBank, form.recipientBank)}
      />
      <Field
        label={ru.banking.fields.recipientAccount}
        value={form.recipientAccount}
        onChange={(e) => setFormField('recipientAccount', e.target.value)}
        onBlur={() => logFieldCommit(BANKING_FIELD_IDS.recipientAccount, form.recipientAccount)}
      />
      <Field
        label={ru.banking.fields.amount}
        value={form.amount}
        onChange={(e) => setFormField('amount', e.target.value)}
        onBlur={() => logFieldCommit(BANKING_FIELD_IDS.amount, form.amount)}
        inputMode="numeric"
      />
      <Field
        label={ru.banking.fields.comment}
        value={form.comment}
        onChange={(e) => setFormField('comment', e.target.value)}
        onBlur={() => logFieldCommit(BANKING_FIELD_IDS.comment)}
      />
    </>
  )
}
