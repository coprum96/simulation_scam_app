import { create } from 'zustand'
import { defaultDappByScenario } from '../../data/mockDapps'
import type {
  WalletFlowState,
  WalletResultType,
  WalletStepId,
} from '../../types/walletFlow'
import type { ScenarioId } from '../../types/scenario'

type WalletFlowActions = {
  initForScenario: (scenarioId: ScenarioId) => void
  setCurrentStepId: (stepId: WalletStepId) => void
  setConnectedDappId: (dappId: string) => void
  setDetailsReviewed: (value: boolean) => void
  setRecoveryPhrase: (value: string) => void
  setWarningAcknowledged: (value: boolean) => void
  setResultType: (value: WalletResultType) => void
  reset: () => void
}

const initialState: WalletFlowState = {
  scenarioId: null,
  currentStepId: null,
  connectedDappId: null,
  detailsReviewed: false,
  recoveryPhrase: '',
  warningAcknowledged: false,
  resultType: null,
}

export const useWalletFlowStore = create<WalletFlowState & WalletFlowActions>((set) => ({
  ...initialState,

  initForScenario: (scenarioId) => {
    set({
      scenarioId,
      currentStepId: null,
      connectedDappId: defaultDappByScenario[scenarioId] ?? null,
      detailsReviewed: false,
      recoveryPhrase: '',
      warningAcknowledged: false,
      resultType: null,
    })
  },

  setCurrentStepId: (stepId) => set({ currentStepId: stepId }),

  setConnectedDappId: (dappId) => set({ connectedDappId: dappId }),

  setDetailsReviewed: (value) => set({ detailsReviewed: value }),

  setRecoveryPhrase: (value) => set({ recoveryPhrase: value }),

  setWarningAcknowledged: (value) => set({ warningAcknowledged: value }),

  setResultType: (value) => set({ resultType: value }),

  reset: () => set({ ...initialState }),
}))
