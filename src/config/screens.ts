/** Идентификаторы экранов хаба */
export const SCREEN_IDS = {
  scenarioHub: 'scenario_hub',
} as const

/** screenId банковского flow (см. SCENARIOS_RU.md) */
export const BANKING_SCREEN_IDS = {
  home: 'home',
  accounts: 'accounts',
  transfer: 'transfer',
  newRecipient: 'new_recipient',
  review: 'review',
  warning: 'warning',
  confirm: 'confirm',
  result: 'result',
} as const

/** screenId wallet flow (см. SCENARIOS_RU.md) */
export const WALLET_SCREEN_IDS = {
  walletHome: 'wallet_home',
  assets: 'assets',
  connectService: 'connect_service',
  signOperation: 'sign_operation',
  assetApproval: 'asset_approval',
  warning: 'warning',
  recoveryScreen: 'recovery_screen',
  result: 'result',
} as const

export type HubScreenId = (typeof SCREEN_IDS)[keyof typeof SCREEN_IDS]
export type BankingScreenId = (typeof BANKING_SCREEN_IDS)[keyof typeof BANKING_SCREEN_IDS]
export type WalletScreenId = (typeof WALLET_SCREEN_IDS)[keyof typeof WALLET_SCREEN_IDS]
export type ScreenId = HubScreenId | BankingScreenId | WalletScreenId

const BANKING_STEP_TO_SCREEN: Record<string, BankingScreenId> = {
  home: BANKING_SCREEN_IDS.home,
  accounts: BANKING_SCREEN_IDS.accounts,
  transfer: BANKING_SCREEN_IDS.transfer,
  new_recipient: BANKING_SCREEN_IDS.newRecipient,
  review: BANKING_SCREEN_IDS.review,
  warning: BANKING_SCREEN_IDS.warning,
  confirm: BANKING_SCREEN_IDS.confirm,
  result: BANKING_SCREEN_IDS.result,
}

export function bankingScreenIdFromStep(stepId: string): BankingScreenId {
  return BANKING_STEP_TO_SCREEN[stepId] ?? BANKING_SCREEN_IDS.home
}

export function isBankingScreenId(id: string): id is BankingScreenId {
  return Object.values(BANKING_SCREEN_IDS).includes(id as BankingScreenId)
}

export function isWalletScreenId(id: string): id is WalletScreenId {
  return Object.values(WALLET_SCREEN_IDS).includes(id as WalletScreenId)
}
