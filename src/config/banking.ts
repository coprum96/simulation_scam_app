import { ru } from '../content/ru'

export const WARNING_CONTENT_KEYS = {
  'bank.safe_account': 'safeAccount',
  'bank.no_share_codes': 'noShareCodes',
  'bank.new_recipient_warning': 'newRecipientWarning',
  'bank.verify_details': 'verifyDetails',
  'bank.phone_instruction': 'phoneInstruction',
} as const

export type WarningContentKey =
  (typeof WARNING_CONTENT_KEYS)[keyof typeof WARNING_CONTENT_KEYS]

export function warningTextByKey(warningKey: string): string | undefined {
  const contentKey = WARNING_CONTENT_KEYS[warningKey as keyof typeof WARNING_CONTENT_KEYS]
  if (!contentKey) return undefined
  return ru.banking.warnings[contentKey]
}

export const BANKING_SCREEN_TITLES: Record<string, string> = {
  home: ru.banking.screens.home,
  accounts: ru.banking.screens.accounts,
  transfer: ru.banking.screens.transfer,
  new_recipient: ru.banking.screens.newRecipient,
  review: ru.banking.screens.review,
  warning: ru.banking.screens.warning,
  confirm: ru.banking.screens.confirm,
  result: ru.banking.screens.result,
}
