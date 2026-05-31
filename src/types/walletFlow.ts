import type { FlowResultType } from './contracts'
import type { ScenarioId } from './scenario'

export type WalletStepId =
  | 'wallet_home'
  | 'assets'
  | 'connect_service'
  | 'sign_operation'
  | 'asset_approval'
  | 'warning'
  | 'recovery_screen'
  | 'result'

export type WalletResultType = FlowResultType

export type WalletFlowState = {
  scenarioId: ScenarioId | null
  currentStepId: WalletStepId | null
  connectedDappId: string | null
  detailsReviewed: boolean
  recoveryPhrase: string
  warningAcknowledged: boolean
  resultType: WalletResultType | null
}
