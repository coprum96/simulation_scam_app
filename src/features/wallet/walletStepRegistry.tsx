import type { Scenario } from '../../types/scenario'
import type { WalletStepId } from '../../types/walletFlow'
import type { WalletNavigation } from './useWalletNavigation'
import type { WalletFlowActions } from './useWalletFlowActions'
import { WalletHomeScreen } from './screens/WalletHomeScreen'
import { AssetsScreen } from './screens/AssetsScreen'
import { ConnectAppScreen } from './screens/ConnectAppScreen'
import { SignatureRequestScreen } from './screens/SignatureRequestScreen'
import { AssetApprovalScreen } from './screens/AssetApprovalScreen'
import { WarningScreen } from './screens/WarningScreen'
import { RecoveryScreen } from './screens/RecoveryScreen'
import { ResultScreen } from './screens/ResultScreen'

type RenderWalletStepProps = {
  scenario: Scenario
  stepId: WalletStepId
  stepIndex: number
  navigation: WalletNavigation
  flow: WalletFlowActions
  onFlowFinished: () => void
}

export function renderWalletStep({
  scenario,
  stepId,
  stepIndex,
  navigation,
  flow,
  onFlowFinished,
}: RenderWalletStepProps) {
  switch (stepId) {
    case 'wallet_home':
      return <WalletHomeScreen navigation={navigation} flow={flow} />
    case 'assets':
      return <AssetsScreen navigation={navigation} flow={flow} />
    case 'connect_service':
      return <ConnectAppScreen scenario={scenario} navigation={navigation} flow={flow} />
    case 'sign_operation':
      return <SignatureRequestScreen navigation={navigation} flow={flow} />
    case 'asset_approval':
      return (
        <AssetApprovalScreen navigation={navigation} flow={flow} stepIndex={stepIndex} />
      )
    case 'warning':
      return (
        <WarningScreen
          scenario={scenario}
          navigation={navigation}
          flow={flow}
          stepIndex={stepIndex}
        />
      )
    case 'recovery_screen':
      return <RecoveryScreen navigation={navigation} flow={flow} />
    case 'result':
      return <ResultScreen onFinished={onFlowFinished} />
    default:
      return null
  }
}
