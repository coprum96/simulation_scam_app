import { BANKING_SCREEN_IDS, type BankingScreenId } from '../../config/screens'
import type { Scenario } from '../../types/scenario'
import type { BankingStepId } from '../../types/bankingFlow'

export const BANKING_STEP_IDS = [
  'home',
  'accounts',
  'transfer',
  'new_recipient',
  'review',
  'warning',
  'confirm',
  'result',
] as const satisfies readonly BankingStepId[]

const STEP_SET = new Set<string>(BANKING_STEP_IDS)

export function isBankingStepId(step: string): step is BankingStepId {
  return STEP_SET.has(step)
}

/** Шаги сценария с учётом warningsEnabled */
export function resolveBankingFlowSteps(scenario: Scenario): BankingStepId[] {
  return scenario.steps.filter((step): step is BankingStepId => {
    if (!isBankingStepId(step)) return false
    if (step === 'warning' && !scenario.warningsEnabled) return false
    return true
  })
}

const STEP_TO_SCREEN: Record<BankingStepId, BankingScreenId> = {
  home: BANKING_SCREEN_IDS.home,
  accounts: BANKING_SCREEN_IDS.accounts,
  transfer: BANKING_SCREEN_IDS.transfer,
  new_recipient: BANKING_SCREEN_IDS.newRecipient,
  review: BANKING_SCREEN_IDS.review,
  warning: BANKING_SCREEN_IDS.warning,
  confirm: BANKING_SCREEN_IDS.confirm,
  result: BANKING_SCREEN_IDS.result,
}

export function screenIdForBankingStep(stepId: BankingStepId): BankingScreenId {
  return STEP_TO_SCREEN[stepId]
}

export function nextStepId(
  steps: BankingStepId[],
  stepIndex: number,
): BankingStepId | undefined {
  return steps[stepIndex + 1]
}
