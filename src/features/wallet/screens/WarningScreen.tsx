import { useEffect, useRef } from 'react'
import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { WalletWarningMessagesList } from '../components/WalletWarningMessagesList'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import { nextWalletStepId } from '../walletStepConfig'
import type { Scenario } from '../../../types/scenario'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type WarningScreenProps = {
  scenario: Scenario
  navigation: WalletNavigation
  flow: WalletFlowActions
  stepIndex: number
}

export function WarningScreen({ scenario, navigation, flow, stepIndex }: WarningScreenProps) {
  const { logEvent, logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.warning)
  const setWarningAcknowledged = useWalletFlowStore((s) => s.setWarningAcknowledged)
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
    const next = nextWalletStepId(steps, stepIndex)
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
    <WalletStepLayout stepId="warning" canGoBack={canGoBack} onBack={goBack}>
      <div className="mb-4">
        <WalletWarningMessagesList warningKeys={scenario.warningKeys} />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleContinue}>{ru.buttons.continue}</Button>
        <Button variant="secondary" onClick={handleCancel}>
          {ru.buttons.cancelOperation}
        </Button>
      </div>
    </WalletStepLayout>
  )
}
