import { useCallback } from 'react'
import type { Scenario } from '../../types/scenario'
import { useSessionStore } from '../telemetry/sessionStore'
import { resolveWalletFlowSteps, screenIdForWalletStep } from './walletStepConfig'

export function useWalletNavigation(
  scenario: Scenario,
  stepIndex: number,
  setStepIndex: (index: number) => void,
) {
  const steps = resolveWalletFlowSteps(scenario)
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
      screenId: screenIdForWalletStep(step),
      meta: { buttonId: 'navigate_back' },
    })
    goToIndex(stepIndex - 1)
  }, [stepIndex, steps, goToIndex, logEvent])

  return {
    steps,
    currentStep: steps[stepIndex] ?? null,
    canGoBack: stepIndex > 0,
    goNext,
    goBack,
    goToIndex,
  }
}

export type WalletNavigation = ReturnType<typeof useWalletNavigation>
