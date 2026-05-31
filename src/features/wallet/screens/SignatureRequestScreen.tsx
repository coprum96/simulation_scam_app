import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type SignatureRequestScreenProps = {
  navigation: WalletNavigation
  flow: WalletFlowActions
}

export function SignatureRequestScreen({ navigation, flow }: SignatureRequestScreenProps) {
  const { logEvent, logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.signOperation)
  const detailsReviewed = useWalletFlowStore((s) => s.detailsReviewed)
  const setDetailsReviewed = useWalletFlowStore((s) => s.setDetailsReviewed)
  const { canGoBack, goBack } = navigation

  const handleApprove = () => {
    logEvent({
      eventType: 'signature_approve',
      meta: { detailsReviewed, action: 'signature_approved' },
    })
    flow.goToResult('confirmed')
  }

  const handleReject = () => {
    logEvent({ eventType: 'signature_reject' })
    flow.goToResult('cancelled')
  }

  return (
    <WalletStepLayout stepId="sign_operation" canGoBack={canGoBack} onBack={goBack}>
      <Card className="mb-4">
        <p className="font-medium text-slate-900">{ru.wallet.signature.title}</p>
        {detailsReviewed ? (
          <p className="mt-2 text-sm text-slate-600">{ru.wallet.signature.operationSummary}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">{ru.wallet.signature.hiddenDetails}</p>
        )}
        <Button
          className="mt-3"
          variant="secondary"
          onClick={() => {
            const next = !detailsReviewed
            setDetailsReviewed(next)
            logButtonClick(next ? 'show_details' : 'hide_details')
          }}
        >
          {detailsReviewed ? ru.wallet.signature.hideDetails : ru.wallet.signature.showDetails}
        </Button>
      </Card>
      <div className="flex flex-col gap-2">
        <Button onClick={handleApprove}>{ru.buttons.confirm}</Button>
        <Button variant="secondary" onClick={handleReject}>
          {ru.buttons.cancel}
        </Button>
      </div>
    </WalletStepLayout>
  )
}
