import { WALLET_SCREEN_IDS, type WalletScreenId } from '../../config/screens'
import type { Scenario } from '../../types/scenario'
import type { WalletStepId } from '../../types/walletFlow'

export const WALLET_STEP_IDS = [
  'wallet_home',
  'assets',
  'connect_service',
  'sign_operation',
  'asset_approval',
  'warning',
  'recovery_screen',
  'result',
] as const satisfies readonly WalletStepId[]

const STEP_SET = new Set<string>(WALLET_STEP_IDS)

export function isWalletStepId(step: string): step is WalletStepId {
  return STEP_SET.has(step)
}

export function resolveWalletFlowSteps(scenario: Scenario): WalletStepId[] {
  return scenario.steps.filter((step): step is WalletStepId => {
    if (!isWalletStepId(step)) return false
    if (step === 'warning' && !scenario.warningsEnabled) return false
    return true
  })
}

const STEP_TO_SCREEN: Record<WalletStepId, WalletScreenId> = {
  wallet_home: WALLET_SCREEN_IDS.walletHome,
  assets: WALLET_SCREEN_IDS.assets,
  connect_service: WALLET_SCREEN_IDS.connectService,
  sign_operation: WALLET_SCREEN_IDS.signOperation,
  asset_approval: WALLET_SCREEN_IDS.assetApproval,
  warning: WALLET_SCREEN_IDS.warning,
  recovery_screen: WALLET_SCREEN_IDS.recoveryScreen,
  result: WALLET_SCREEN_IDS.result,
}

export function screenIdForWalletStep(stepId: WalletStepId): WalletScreenId {
  return STEP_TO_SCREEN[stepId]
}

export function nextWalletStepId(
  steps: WalletStepId[],
  stepIndex: number,
): WalletStepId | undefined {
  return steps[stepIndex + 1]
}
