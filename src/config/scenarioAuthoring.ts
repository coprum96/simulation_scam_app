import { BANKING_STEP_IDS } from '../features/banking/bankingStepConfig'
import { WALLET_STEP_IDS } from '../features/wallet/walletStepConfig'
import { BANKING_SCREEN_IDS, WALLET_SCREEN_IDS } from './screens'
import type { SimulatorType } from '../types/scenario'

export const SCENARIO_ID_PATTERN = /^[a-z][a-z0-9_]*$/

export const AUTHORING_ACTION_KINDS = ['primary', 'secondary', 'danger'] as const

export const DEFAULT_SCENARIO_CONFIG_ACTIONS = [
  { actionId: 'continue', labelRef: 'buttons.continue', kind: 'primary' as const },
  { actionId: 'cancel', labelRef: 'buttons.cancel', kind: 'secondary' as const },
]

export function allowedStepIdsForSimulator(simulatorType: SimulatorType): readonly string[] {
  return simulatorType === 'banking' ? BANKING_STEP_IDS : WALLET_STEP_IDS
}

export function allowedScreenIdsForSimulator(simulatorType: SimulatorType): readonly string[] {
  return simulatorType === 'banking'
    ? Object.values(BANKING_SCREEN_IDS)
    : Object.values(WALLET_SCREEN_IDS)
}

export function defaultScreenIdForStep(stepId: string, simulatorType: SimulatorType): string {
  if (simulatorType === 'banking') {
    const map: Record<string, string> = {
      home: BANKING_SCREEN_IDS.home,
      accounts: BANKING_SCREEN_IDS.accounts,
      transfer: BANKING_SCREEN_IDS.transfer,
      new_recipient: BANKING_SCREEN_IDS.newRecipient,
      review: BANKING_SCREEN_IDS.review,
      warning: BANKING_SCREEN_IDS.warning,
      confirm: BANKING_SCREEN_IDS.confirm,
      result: BANKING_SCREEN_IDS.result,
    }
    return map[stepId] ?? BANKING_SCREEN_IDS.home
  }
  const map: Record<string, string> = {
    wallet_home: WALLET_SCREEN_IDS.walletHome,
    assets: WALLET_SCREEN_IDS.assets,
    connect_service: WALLET_SCREEN_IDS.connectService,
    sign_operation: WALLET_SCREEN_IDS.signOperation,
    asset_approval: WALLET_SCREEN_IDS.assetApproval,
    warning: WALLET_SCREEN_IDS.warning,
    recovery_screen: WALLET_SCREEN_IDS.recoveryScreen,
    result: WALLET_SCREEN_IDS.result,
  }
  return map[stepId] ?? WALLET_SCREEN_IDS.walletHome
}
