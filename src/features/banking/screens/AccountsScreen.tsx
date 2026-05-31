import { BANKING_SCREEN_IDS } from '../../../config/screens'
import { mockAccounts } from '../../../data/mockAccounts'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { BankingStepLayout } from '../components/BankingStepLayout'
import { useBankingScreen } from '../useBankingScreen'
import type { BankingNavigation } from '../useBankingNavigation'
import type { BankingFlowActions } from '../useBankingFlowActions'

type AccountsScreenProps = {
  navigation: BankingNavigation
  flow: BankingFlowActions
}

export function AccountsScreen({ navigation, flow }: AccountsScreenProps) {
  const { logButtonClick } = useBankingScreen(BANKING_SCREEN_IDS.accounts)
  const { canGoBack, goBack } = navigation

  return (
    <BankingStepLayout stepId="accounts" canGoBack={canGoBack} onBack={goBack}>
      <p className="mb-3 text-sm text-slate-600">{ru.banking.accounts.title}</p>
      <div className="mb-4 space-y-2">
        {mockAccounts.map((account) => (
          <Card key={account.id}>
            <p className="font-medium text-slate-900">{account.name}</p>
            <p className="text-sm text-slate-600">{account.maskedNumber}</p>
            <p className="mt-1 text-sm">{account.balanceRub.toLocaleString('ru-RU')} ₽</p>
          </Card>
        ))}
      </div>
      <Button
        onClick={() => {
          logButtonClick('open_transfer')
          flow.goNext()
        }}
      >
        {ru.banking.accounts.openTransfer}
      </Button>
    </BankingStepLayout>
  )
}
