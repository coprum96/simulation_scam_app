import type { ProfileId } from './profile'
import type { RiskLevel } from './risk'

export type SimulatorType = 'banking' | 'wallet'
export type { RiskLevel }

export type ScenarioId =
  | 'urgent_safe_account_transfer'
  | 'new_recipient_no_warnings'
  | 'transfer_under_phone_instruction'
  | 'cancel_after_bank_warning'
  | 'wallet_blind_signing'
  | 'wallet_malicious_approval'
  | 'wallet_fake_recovery_page'
  | 'wallet_reject_after_warning'

export type Scenario = {
  id: string
  title: string
  description: string
  simulatorType: SimulatorType
  /** Метаданные каталога (хаб/фильтры), не вывод risk engine */
  riskLevel: RiskLevel
  targetProfileIds: ProfileId[]
  steps: string[]
  warningsEnabled: boolean
  warningKeys: string[]
  expectedRiskFlags: string[]
}
