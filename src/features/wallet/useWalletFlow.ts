import { useEffect, useMemo, useRef, useState } from 'react'
import { getScenarioById, mockScenarios } from '../../data/scenarios'
import { useSessionStore } from '../telemetry/sessionStore'
import { useWalletFlowStore } from './walletFlowStore'
import { resolveWalletFlowSteps, screenIdForWalletStep } from './walletStepConfig'
import { useWalletNavigation } from './useWalletNavigation'
import type { Scenario } from '../../types/scenario'
import type { ScenarioId } from '../../types/scenario'
import type { WalletStepId } from '../../types/walletFlow'

export function useWalletFlow(scenarioId: string) {
  const scenario = getScenarioById(scenarioId)
  const walletScenario: Scenario =
    scenario?.simulatorType === 'wallet'
      ? scenario
      : mockScenarios.find((s) => s.simulatorType === 'wallet')!

  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const activeSession = useSessionStore((s) =>
    s.activeSessionId ? s.sessions[s.activeSessionId] : null,
  )
  const logEvent = useSessionStore((s) => s.logEvent)

  const initForScenario = useWalletFlowStore((s) => s.initForScenario)
  const setCurrentStepId = useWalletFlowStore((s) => s.setCurrentStepId)
  const resultType = useWalletFlowStore((s) => s.resultType)
  const setResultType = useWalletFlowStore((s) => s.setResultType)
  const resetFlow = useWalletFlowStore((s) => s.reset)

  const [stepIndex, setStepIndex] = useState(0)
  const lastScreenViewStepRef = useRef<WalletStepId | null>(null)

  const sessionValid = useMemo(
    () =>
      Boolean(activeSessionId) &&
      activeSession?.record.status === 'active' &&
      activeSession.record.scenarioId === scenarioId &&
      scenario?.simulatorType === 'wallet',
    [activeSession, activeSessionId, scenario?.simulatorType, scenarioId],
  )

  const steps = scenario ? resolveWalletFlowSteps(scenario) : []
  const navigation = useWalletNavigation(walletScenario, stepIndex, setStepIndex)
  const currentStep = steps[stepIndex] ?? null

  useEffect(() => {
    if (!scenario || scenario.simulatorType !== 'wallet') return
    initForScenario(scenario.id as ScenarioId)
    setStepIndex(0)
    lastScreenViewStepRef.current = null
    return () => {
      resetFlow()
      lastScreenViewStepRef.current = null
    }
  }, [scenario, initForScenario, resetFlow])

  useEffect(() => {
    if (navigation.currentStep) setCurrentStepId(navigation.currentStep)
  }, [navigation.currentStep, setCurrentStepId])

  useEffect(() => {
    if (!sessionValid || !currentStep) return
    if (lastScreenViewStepRef.current === currentStep) return
    lastScreenViewStepRef.current = currentStep
    logEvent({
      eventType: 'screen_view',
      screenId: screenIdForWalletStep(currentStep),
    })
  }, [sessionValid, currentStep, logEvent])

  useEffect(() => {
    if (currentStep === 'result' && !resultType) {
      setResultType('confirmed')
    }
  }, [currentStep, resultType, setResultType])

  return {
    scenario,
    sessionValid,
    steps,
    stepIndex,
    currentStep,
    navigation,
    resetFlow,
  }
}
