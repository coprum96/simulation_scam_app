import type { BankingTransferForm } from '../../types/bankingFlow'
import type { ScenarioId } from '../../types/scenario'

export function isTransferFormComplete(form: BankingTransferForm): boolean {
  return (
    Boolean(form.recipientAccount.trim()) &&
    Boolean(form.recipientName.trim()) &&
    Boolean(form.amount.trim())
  )
}

export function isConfirmationCodeValid(code: string): boolean {
  return code.trim().length >= 4
}

export function shouldShowPhoneInstructionBanner(scenarioId: ScenarioId): boolean {
  return scenarioId === 'transfer_under_phone_instruction'
}
