import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { mainAccount } from '../../../data/mockAccounts'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { useBankingScreen } from '../useBankingScreen'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type HomeScreenProps = {
  navigation: BankingNavigation
  flow: BankingFlowActions
}

export function HomeScreen({ navigation, flow }: HomeScreenProps) {
  const { logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.home)
  const { canGoBack, goBack } = navigation

  return (
    <BankingStepLayout stepId="home" canGoBack={canGoBack} onBack={goBack}>
      <Card className="mb-4">
        <p className="text-sm text-slate-500">{ru.banking.home.greeting}</p>
        <p className="mt-1 font-medium text-slate-900">{mainAccount.name}</p>
        <p className="text-sm text-slate-600">{mainAccount.maskedNumber}</p>
        <p className="mt-2 text-lg font-semibold">
          {mainAccount.balanceRub.toLocaleString('ru-RU')} ₽
        </p>
        <p className="text-xs text-slate-500">{ru.banking.home.availableBalance}</p>
      </Card>
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => {
            logButtonClick('quick_transfer')
            flow.goToStep('transfer')
          }}
        >
          {ru.banking.home.quickTransfer}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            logButtonClick('view_accounts')
            flow.goToStep('accounts')
          }}
        >
          {ru.banking.home.viewAccounts}
        </Button>
      </div>
    </BankingStepLayout>
  )
}
