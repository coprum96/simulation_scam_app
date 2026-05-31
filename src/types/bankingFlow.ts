import type { FlowResultType } from './contracts'
import type { ScenarioId } from './scenario'

export type BankingStepId =
  | 'home'
  | 'accounts'
  | 'transfer'
  | 'new_recipient'
  | 'review'
  | 'warning'
  | 'confirm'
  | 'result'

export type BankingTransferForm = {
  recipientAccount: string
  recipientName: string
  recipientBank: string
  amount: string
  comment: string
  confirmationCode: string
}

/** @deprecated Use FlowResultType from contracts */
export type BankingResultType = FlowResultType

export type BankingFlowState = {
  scenarioId: ScenarioId | null
  currentStepId: BankingStepId | null
  form: BankingTransferForm
  warningAcknowledged: boolean
  resultType: BankingResultType | null
}
