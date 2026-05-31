export type MockRecipientPreset = {
  account: string
  name: string
  bank: string
  amount: string
  comment: string
}

export const mockRecipientPresets: Record<string, MockRecipientPreset> = {
  urgent_safe_account_transfer: {
    account: '40817810099910004312',
    name: 'Служба безопасности',
    bank: 'Демо-Банк',
    amount: '150000',
    comment: 'Срочный перевод',
  },
  transfer_under_phone_instruction: {
    account: '40817810999910001234',
    name: 'Иванов И.И.',
    bank: 'Демо-Банк',
    amount: '85000',
    comment: '',
  },
  new_recipient_no_warnings: {
    account: '40817810777710005678',
    name: 'ООО «ТехноСнаб»',
    bank: 'Демо-Банк',
    amount: '200000',
    comment: 'Оплата по счёту',
  },
  cancel_after_bank_warning: {
    account: '40817810123410009999',
    name: 'ООО «Поставщик»',
    bank: 'Демо-Банк',
    amount: '50000',
    comment: 'Оплата услуг',
  },
}
