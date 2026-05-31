import type { Scenario } from '../../types/scenario'
import type { BankingStepId } from '../../types/bankingFlow'
import type { BankingNavigation } from './useBankingNavigation'
import type { BankingFlowActions } from './useBankingFlowActions'
import { HomeScreen } from './screens/HomeScreen'
import { AccountsScreen } from './screens/AccountsScreen'
import { TransferScreen } from './screens/TransferScreen'
import { NewRecipientScreen } from './screens/NewRecipientScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { ConfirmScreen } from './screens/ConfirmScreen'
import { WarningScreen } from './screens/WarningScreen'
import { ResultScreen } from './screens/ResultScreen'
import type { ScenarioId } from '../../types/scenario'

type RenderBankingStepProps = {
  scenario: Scenario
  stepId: BankingStepId
  stepIndex: number
  navigation: BankingNavigation
  flow: BankingFlowActions
  onFlowFinished: () => void
}

export function renderBankingStep({
  scenario,
  stepId,
  stepIndex,
  navigation,
  flow,
  onFlowFinished,
}: RenderBankingStepProps) {
  switch (stepId) {
    case 'home':
      return <HomeScreen navigation={navigation} flow={flow} />
    case 'accounts':
      return <AccountsScreen navigation={navigation} flow={flow} />
    case 'transfer':
      return <TransferScreen navigation={navigation} flow={flow} stepIndex={stepIndex} />
    case 'new_recipient':
      return (
        <NewRecipientScreen
          scenarioId={scenario.id as ScenarioId}
          navigation={navigation}
          flow={flow}
        />
      )
    case 'review':
      return <ReviewScreen navigation={navigation} flow={flow} />
    case 'warning':
      return (
        <WarningScreen
          scenario={scenario}
          navigation={navigation}
          flow={flow}
          stepIndex={stepIndex}
        />
      )
    case 'confirm':
      return <ConfirmScreen navigation={navigation} flow={flow} />
    case 'result':
      return <ResultScreen onFinished={onFlowFinished} />
    default:
      return null
  }
}
