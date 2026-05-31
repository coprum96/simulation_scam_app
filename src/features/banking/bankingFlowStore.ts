import { create } from 'zustand'
import { mockRecipientPresets } from '../../data/mockRecipients'
import type {
  BankingFlowState,
  BankingResultType,
  BankingStepId,
  BankingTransferForm,
} from '../../types/bankingFlow'
import type { ScenarioId } from '../../types/scenario'

const emptyForm = (): BankingTransferForm => ({
  recipientAccount: '',
  recipientName: '',
  recipientBank: '',
  amount: '',
  comment: '',
  confirmationCode: '',
})

type BankingFlowActions = {
  initForScenario: (scenarioId: ScenarioId) => void
  setCurrentStepId: (stepId: BankingStepId) => void
  setFormField: <K extends keyof BankingTransferForm>(key: K, value: BankingTransferForm[K]) => void
  setWarningAcknowledged: (value: boolean) => void
  setResultType: (value: BankingResultType) => void
  reset: () => void
}

const initialState: BankingFlowState = {
  scenarioId: null,
  currentStepId: null,
  form: emptyForm(),
  warningAcknowledged: false,
  resultType: null,
}

export const useBankingFlowStore = create<BankingFlowState & BankingFlowActions>((set) => ({
  ...initialState,

  initForScenario: (scenarioId) => {
    const preset = mockRecipientPresets[scenarioId]
    set({
      scenarioId,
      currentStepId: null,
      warningAcknowledged: false,
      resultType: null,
      form: preset
        ? {
            recipientAccount: preset.account,
            recipientName: preset.name,
            recipientBank: preset.bank,
            amount: preset.amount,
            comment: preset.comment,
            confirmationCode: '',
          }
        : emptyForm(),
    })
  },

  setCurrentStepId: (stepId) => set({ currentStepId: stepId }),

  setFormField: (key, value) =>
    set((state) => ({
      form: { ...state.form, [key]: value },
    })),

  setWarningAcknowledged: (value) => set({ warningAcknowledged: value }),

  setResultType: (value) => set({ resultType: value }),

  reset: () => set({ ...initialState, form: emptyForm() }),
}))
