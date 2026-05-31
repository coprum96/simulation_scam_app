import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { mockDapps } from '../../../data/mockDapps'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import { nextWalletStepId } from '../walletStepConfig'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type AssetApprovalScreenProps = {
  navigation: WalletNavigation
  flow: WalletFlowActions
  stepIndex: number
}

export function AssetApprovalScreen({ navigation, flow, stepIndex }: AssetApprovalScreenProps) {
  const { logEvent } = useWalletScreen(WALLET_SCREEN_IDS.assetApproval)
  const connectedDappId = useWalletFlowStore((s) => s.connectedDappId)
  const setDetailsReviewed = useWalletFlowStore((s) => s.setDetailsReviewed)
  const { canGoBack, goBack, steps } = navigation

  const dapp = mockDapps.find((d) => d.id === connectedDappId)
  const next = nextWalletStepId(steps, stepIndex)

  const handleApprove = () => {
    setDetailsReviewed(true)
    logEvent({ eventType: 'confirm', meta: { action: 'approval_granted' } })
    if (next === 'result') {
      flow.goToResult('confirmed')
    } else {
      flow.goNext()
    }
  }

  const handleReject = () => {
    logEvent({ eventType: 'cancel', meta: { action: 'approval_rejected' } })
    flow.goToResult('cancelled')
  }

  return (
    <WalletStepLayout stepId="asset_approval" canGoBack={canGoBack} onBack={goBack}>
      <Card className="mb-4 space-y-2 text-sm">
        <p className="font-medium text-slate-900">{ru.wallet.approval.title}</p>
        {dapp ? <p className="text-slate-600">{dapp.name}</p> : null}
        <p className="text-slate-700">{ru.wallet.approval.unlimited}</p>
        <p className="text-slate-500">{ru.wallet.approval.reviewHint}</p>
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
