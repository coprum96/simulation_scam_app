/**
 * Идентификаторы полей для meta.input_change (не screenId).
 */
export const BANKING_FIELD_IDS = {
  /** Счёт / телефон / карта получателя */
  recipientAccount: 'recipient_account',
  recipientName: 'recipient_name',
  recipientBank: 'recipient_bank',
  amount: 'amount',
  comment: 'comment',
  confirmationCode: 'confirmation_code',
} as const

export type BankingFieldId = (typeof BANKING_FIELD_IDS)[keyof typeof BANKING_FIELD_IDS]
