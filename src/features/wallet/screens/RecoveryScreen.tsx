import { WALLET_FIELD_IDS } from '../../../config/walletFields'
import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import { useSessionStore } from '../../telemetry/sessionStore'
import { isRecoveryPhraseCommitted } from '../walletFlowLogic'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type RecoveryScreenProps = {
  navigation: WalletNavigation
  flow: WalletFlowActions
}

export function RecoveryScreen({ navigation, flow }: RecoveryScreenProps) {
  const { logEvent } = useWalletScreen(WALLET_SCREEN_IDS.recoveryScreen)
  const logEventRaw = useSessionStore((s) => s.logEvent)
  const recoveryPhrase = useWalletFlowStore((s) => s.recoveryPhrase)
  const setRecoveryPhrase = useWalletFlowStore((s) => s.setRecoveryPhrase)
  const { canGoBack, goBack } = navigation

  const logRecoveryCommit = () => {
    if (!recoveryPhrase.trim()) return
    logEventRaw({
      eventType: 'recovery_input',
      screenId: WALLET_SCREEN_IDS.recoveryScreen,
      meta: { fieldId: WALLET_FIELD_IDS.recoveryPhrase, commit: true },
    })
  }

  const handleSubmit = () => {
    if (!isRecoveryPhraseCommitted(recoveryPhrase)) return
    logRecoveryCommit()
    logEvent({ eventType: 'confirm', meta: { action: 'recovery_submitted' } })
    flow.goToResult('confirmed')
  }

  const handleCancel = () => {
    logEvent({ eventType: 'cancel', meta: { action: 'recovery_cancelled' } })
    flow.goToResult('cancelled')
  }

  return (
    <WalletStepLayout stepId="recovery_screen" canGoBack={canGoBack} onBack={goBack}>
      <Card className="mb-4 border-red-200 bg-red-50">
        <p className="text-sm font-medium text-red-950">{ru.wallet.recovery.supportBanner}</p>
      </Card>
      <Card>
        <p className="mb-2 font-medium text-slate-900">{ru.wallet.recovery.title}</p>
        <p className="mb-3 text-sm text-slate-600">{ru.wallet.recovery.phraseHint}</p>
        <Field
          label={ru.wallet.fields.recoveryPhrase}
          value={recoveryPhrase}
          onChange={(e) => setRecoveryPhrase(e.target.value)}
          onBlur={logRecoveryCommit}
        />
      </Card>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={handleSubmit} disabled={!isRecoveryPhraseCommitted(recoveryPhrase)}>
          {ru.buttons.confirm}
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          {ru.buttons.cancelOperation}
        </Button>
      </div>
    </WalletStepLayout>
  )
}
