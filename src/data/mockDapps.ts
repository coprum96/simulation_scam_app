export type MockDapp = {
  id: string
  name: string
  description: string
  address: string
  isHighRisk: boolean
}

export const mockDapps: MockDapp[] = [
  {
    id: 'defi_swap_demo',
    name: 'DeFi Swap (демо)',
    description: 'Обмен токенов',
    address: '0x7a2…4f9',
    isHighRisk: false,
  },
  {
    id: 'security_check_fake',
    name: 'Проверка безопасности',
    description: 'Имитация сервиса «защиты» средств',
    address: '0x9f3…a21',
    isHighRisk: true,
  },
]

export const defaultDappByScenario: Record<string, string> = {
  wallet_blind_signing: 'defi_swap_demo',
  wallet_malicious_approval: 'security_check_fake',
  wallet_fake_recovery_page: 'security_check_fake',
  wallet_reject_after_warning: 'security_check_fake',
}
