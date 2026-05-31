import { useCallback } from 'react'
import type { Scenario } from '../../types/scenario'
import type { BankingStepId } from '../../types/bankingFlow'
import { useSessionStore } from '../telemetry/sessionStore'
import { resolveBankingFlowSteps, screenIdForBankingStep } from './bankingStepConfig'

export function useBankingNavigation(
  scenario: Scenario,
  stepIndex: number,
  setStepIndex: (index: number) => void,
) {
  const steps = resolveBankingFlowSteps(scenario)
  const logEvent = useSessionStore((s) => s.logEvent)

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) return
      setStepIndex(index)
    },
    [steps.length, setStepIndex],
  )

  const goNext = useCallback(() => goToIndex(stepIndex + 1), [goToIndex, stepIndex])

  const goBack = useCallback(() => {
    const step = steps[stepIndex]
    if (!step || stepIndex === 0) return
    logEvent({
      eventType: 'button_click',
      screenId: screenIdForBankingStep(step),
      meta: { buttonId: 'navigate_back' },
    })
    goToIndex(stepIndex - 1)
  }, [stepIndex, steps, goToIndex, logEvent])

  const canGoBack = stepIndex > 0
  const currentStep = steps[stepIndex] ?? null

  return { steps, currentStep, canGoBack, goNext, goBack, goToIndex }
}

export type BankingNavigation = ReturnType<typeof useBankingNavigation>

export function useGoToBankingStep(
  setStepIndex: (index: number) => void,
  steps: BankingStepId[],
) {
  return useCallback(
    (stepId: BankingStepId) => {
      const index = steps.indexOf(stepId)
      if (index >= 0) setStepIndex(index)
    },
    [steps, setStepIndex],
  )
}
