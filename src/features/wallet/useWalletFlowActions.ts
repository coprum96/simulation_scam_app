import { useCallback } from 'react'
import { useWalletFlowStore } from './walletFlowStore'
import type { WalletNavigation } from './useWalletNavigation'
import type { WalletResultType, WalletStepId } from '../../types/walletFlow'

export type WalletFlowActions = ReturnType<typeof useWalletFlowActions>

export function useWalletFlowActions(navigation: WalletNavigation) {
  const setResultType = useWalletFlowStore((s) => s.setResultType)

  const goToResult = useCallback(
    (resultType: WalletResultType) => {
      setResultType(resultType)
      const resultIndex = navigation.steps.indexOf('result')
      if (resultIndex >= 0) navigation.goToIndex(resultIndex)
    },
    [navigation, setResultType],
  )

  const goToStep = useCallback(
    (stepId: WalletStepId) => {
      const index = navigation.steps.indexOf(stepId)
      if (index >= 0) navigation.goToIndex(index)
    },
    [navigation],
  )

  return {
    goNext: navigation.goNext,
    goBack: navigation.goBack,
    goToStep,
    goToResult,
    canGoBack: navigation.canGoBack,
    steps: navigation.steps,
  }
}
