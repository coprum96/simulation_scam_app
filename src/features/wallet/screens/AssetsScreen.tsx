import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { AssetListCard } from '../components/AssetListCard'
import { useWalletScreen } from '../useWalletScreen'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type AssetsScreenProps = {
  navigation: WalletNavigation
  flow: WalletFlowActions
}

export function AssetsScreen({ navigation, flow }: AssetsScreenProps) {
  const { logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.assets)
  const { canGoBack, goBack } = navigation

  return (
    <WalletStepLayout stepId="assets" canGoBack={canGoBack} onBack={goBack}>
      <p className="mb-3 text-sm text-slate-600">{ru.wallet.assets.title}</p>
      <AssetListCard />
      <Button
        className="mt-4 w-full"
        onClick={() => {
          logButtonClick('continue_from_assets')
          flow.goNext()
        }}
      >
        {ru.buttons.continue}
      </Button>
    </WalletStepLayout>
  )
}
