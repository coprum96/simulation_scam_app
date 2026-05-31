import { WALLET_SCREEN_IDS } from '../../../config/screens'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { WalletStepLayout } from '../components/WalletStepLayout'
import { DappConnectCard } from '../components/DappConnectCard'
import { mockDapps } from '../../../data/mockDapps'
import { useWalletFlowStore } from '../walletFlowStore'
import { useWalletScreen } from '../useWalletScreen'
import { shouldShowFakeSecurityAlert } from '../walletFlowLogic'
import type { Scenario, ScenarioId } from '../../../types/scenario'
import type { WalletNavigation } from '../useWalletNavigation'
import type { WalletFlowActions } from '../useWalletFlowActions'

type ConnectAppScreenProps = {
  scenario: Scenario
  navigation: WalletNavigation
  flow: WalletFlowActions
}

export function ConnectAppScreen({ scenario, navigation, flow }: ConnectAppScreenProps) {
  const { logButtonClick } = useWalletScreen(WALLET_SCREEN_IDS.connectService)
  const connectedDappId = useWalletFlowStore((s) => s.connectedDappId)
  const setConnectedDappId = useWalletFlowStore((s) => s.setConnectedDappId)
  const { canGoBack, goBack } = navigation

  const dapp = mockDapps.find((d) => d.id === connectedDappId) ?? mockDapps[0]!

  return (
    <WalletStepLayout stepId="connect_service" canGoBack={canGoBack} onBack={goBack}>
      <p className="mb-3 text-sm text-slate-600">{ru.wallet.connect.hint}</p>
      <div className="mb-4 space-y-2">
        {mockDapps.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              connectedDappId === item.id
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-400'
            }`}
            onClick={() => {
              setConnectedDappId(item.id)
              logButtonClick('select_dapp', { dappId: item.id })
            }}
          >
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.address}</p>
          </button>
        ))}
      </div>
      <DappConnectCard
        dapp={dapp}
        showFakeAlert={shouldShowFakeSecurityAlert(scenario.id as ScenarioId)}
      />
      <Button
        className="mt-4 w-full"
        onClick={() => {
          logButtonClick('connect_confirm')
          flow.goNext()
        }}
      >
        {ru.buttons.continue}
      </Button>
    </WalletStepLayout>
  )
}
