import { useCallback } from 'react'
import { useBankingFlowStore } from './bankingFlowStore'
import type { BankingNavigation } from './useBankingNavigation'
import type { BankingResultType } from '../../types/bankingFlow'

/** Навигация и результат flow (без session/telemetry) */
export type BankingFlowActions = ReturnType<typeof useBankingFlowActions>

export function useBankingFlowActions(navigation: BankingNavigation) {
  const setResultType = useBankingFlowStore((s) => s.setResultType)

  const goToResult = useCallback(
    (resultType: BankingResultType) => {
      setResultType(resultType)
      const resultIndex = navigation.steps.indexOf('result')
      if (resultIndex >= 0) navigation.goToIndex(resultIndex)
    },
    [navigation, setResultType],
  )

  const goToStep = useCallback(
    (stepId: (typeof navigation.steps)[number]) => {
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
