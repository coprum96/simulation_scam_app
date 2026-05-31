export type WalletAsset = {
  id: string
  symbol: string
  name: string
  balance: string
  fiatRub: number
}

export const mockWalletAssets: WalletAsset[] = [
  { id: 'eth', symbol: 'ETH', name: 'Эфириум', balance: '2.45', fiatRub: 612_000 },
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', balance: '15 200', fiatRub: 1_422_720 },
  { id: 'btc', symbol: 'BTC', name: 'Биткоин', balance: '0.12', fiatRub: 1_080_000 },
]

export const walletTotalBalanceRub = mockWalletAssets.reduce((sum, a) => sum + a.fiatRub, 0)
