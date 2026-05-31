/** Идентификаторы полей для wallet telemetry meta */
export const WALLET_FIELD_IDS = {
  recoveryPhrase: 'recovery_phrase',
} as const

export type WalletFieldId = (typeof WALLET_FIELD_IDS)[keyof typeof WALLET_FIELD_IDS]
