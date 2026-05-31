import { useEffect, useMemo, useRef, useState } from 'react'
import { getScenarioById, mockScenarios } from '../../data/scenarios'
import { useSessionStore } from '../telemetry/sessionStore'
import { useBankingFlowStore } from './bankingFlowStore'
import { resolveBankingFlowSteps, screenIdForBankingStep } from './bankingStepConfig'
import { useBankingNavigation } from './useBankingNavigation'
import type { Scenario } from '../../types/scenario'
import type { ScenarioId } from '../../types/scenario'
import type { BankingStepId } from '../../types/bankingFlow'

export function useBankingFlow(scenarioId: string) {
  const scenario = getScenarioById(scenarioId)
  const bankingScenario: Scenario =
    scenario?.simulatorType === 'banking'
      ? scenario
      : mockScenarios.find((s) => s.simulatorType === 'banking')!

  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const activeSession = useSessionStore((s) =>
    s.activeSessionId ? s.sessions[s.activeSessionId] : null,
  )
  const logEvent = useSessionStore((s) => s.logEvent)

  const initForScenario = useBankingFlowStore((s) => s.initForScenario)
  const setCurrentStepId = useBankingFlowStore((s) => s.setCurrentStepId)
  const resultType = useBankingFlowStore((s) => s.resultType)
  const setResultType = useBankingFlowStore((s) => s.setResultType)
  const resetFlow = useBankingFlowStore((s) => s.reset)

  const [stepIndex, setStepIndex] = useState(0)
  const lastScreenViewStepRef = useRef<BankingStepId | null>(null)

  const sessionValid = useMemo(
    () =>
      Boolean(activeSessionId) &&
      activeSession?.record.status === 'active' &&
      activeSession.record.scenarioId === scenarioId &&
      scenario?.simulatorType === 'banking',
    [activeSession, activeSessionId, scenario?.simulatorType, scenarioId],
  )

  const steps = scenario ? resolveBankingFlowSteps(scenario) : []
  const navigation = useBankingNavigation(bankingScenario, stepIndex, setStepIndex)
  const currentStep = steps[stepIndex] ?? null

  useEffect(() => {
    if (!scenario || scenario.simulatorType !== 'banking') return
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

  /** Один screen_view на переход шага (без дублей от remount/StrictMode в компонентах) */
  useEffect(() => {
    if (!sessionValid || !currentStep) return
    if (lastScreenViewStepRef.current === currentStep) return
    lastScreenViewStepRef.current = currentStep
    logEvent({
      eventType: 'screen_view',
      screenId: screenIdForBankingStep(currentStep),
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
