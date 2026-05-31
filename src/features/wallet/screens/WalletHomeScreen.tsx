import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { walletTotalBalanceRub } from '../../../data/mockWalletAssets'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { useWalletScreen } from '../useWalletScreen'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type WalletHomeScreenProps = {
  navigation: WalletNavigation
  flow: WalletFlowActions
}

export function WalletHomeScreen({ navigation, flow }: WalletHomeScreenProps) {
  const { logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.walletHome)
  const { canGoBack, goBack } = navigation

  return (
    <WalletStepLayout stepId="wallet_home" canGoBack={canGoBack} onBack={goBack}>
      <Card className="mb-4">
        <p className="text-sm text-slate-500">{ru.wallet.home.greeting}</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {walletTotalBalanceRub.toLocaleString('ru-RU')} ₽
        </p>
        <p className="text-xs text-slate-500">{ru.wallet.home.totalBalance}</p>
      </Card>
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => {
            logButtonClick('view_assets')
            flow.goToStep('assets')
          }}
        >
          {ru.wallet.home.viewAssets}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            logButtonClick('connect_dapp')
            flow.goToStep('connect_service')
          }}
        >
          {ru.wallet.home.connectDapp}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            logButtonClick('continue_flow')
            flow.goNext()
          }}
        >
          {ru.buttons.continue}
        </Button>
      </div>
    </WalletStepLayout>
  )
}
