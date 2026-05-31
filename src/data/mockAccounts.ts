export type MockAccount = {
  id: string
  name: string
  maskedNumber: string
  balanceRub: number
}

export const mockAccounts: MockAccount[] = [
  {
    id: 'acc_main',
    name: 'Основной счёт',
    maskedNumber: '•••• 4521',
    balanceRub: 324_500,
  },
  {
    id: 'acc_savings',
    name: 'Накопительный',
    maskedNumber: '•••• 8834',
    balanceRub: 150_000,
  },
]

export const mainAccount = mockAccounts[0]!
