import { useEffect, useRef } from 'react'
import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { WarningMessagesList } from '../components/WarningMessagesList'
import { useBankingFlowStore } from '../bankingFlowStore'
import { useBankingScreen } from '../useBankingScreen'
import { nextStepId } from '../bankingStepConfig'
import type { Scenario } from '../../../types/scenario'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type WarningScreenProps = {
  scenario: Scenario
  navigation: BankingNavigation
  flow: BankingFlowActions
  stepIndex: number
}

export function WarningScreen({ scenario, navigation, flow, stepIndex }: WarningScreenProps) {
  const { logEvent, logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.warning)
  const setWarningAcknowledged = useBankingFlowStore((s) => s.setWarningAcknowledged)
  const { canGoBack, goBack, steps } = navigation
  const warnedRef = useRef(false)

  useEffect(() => {
    if (warnedRef.current) return
    logEvent({
      eventType: 'warning_view',
      meta: { warningKeys: scenario.warningKeys },
    })
    warnedRef.current = true
  }, [logEvent, scenario.warningKeys])

  const handleContinue = () => {
    logEvent({
      eventType: 'warning_dismiss',
      meta: { dismissType: 'continued', warningKeys: scenario.warningKeys },
    })
    setWarningAcknowledged(true)
    logButtonClick('warning_continue')
    const next = nextStepId(steps, stepIndex)
    if (next === 'result') {
      flow.goToResult('confirmed')
    } else {
      flow.goNext()
    }
  }

  const handleCancel = () => {
    logEvent({
      eventType: 'warning_dismiss',
      meta: { dismissType: 'cancelled', warningKeys: scenario.warningKeys },
    })
    logEvent({ eventType: 'cancel', meta: { action: 'cancelled_after_warning' } })
    flow.goToResult('cancelled')
  }

  return (
    <BankingStepLayout stepId="warning" canGoBack={canGoBack} onBack={goBack}>
      <div className="mb-4">
        <WarningMessagesList warningKeys={scenario.warningKeys} />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleContinue}>{ru.buttons.continue}</Button>
        <Button variant="secondary" onClick={handleCancel}>
          {ru.buttons.cancelOperation}
        </Button>
      </div>
    </BankingStepLayout>
  )
}
