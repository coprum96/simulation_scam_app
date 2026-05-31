import { mockWalletAssets, walletTotalBalanceRub } from '../../../data/mockWalletAssets'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'

export function AssetListCard() {
  return (
    <div className="space-y-2">
      {mockWalletAssets.map((asset) => (
        <Card key={asset.id}>
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900">
                {asset.symbol} · {asset.name}
              </p>
              <p className="text-sm text-slate-600">{asset.balance}</p>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {asset.fiatRub.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </Card>
      ))}
      <p className="text-xs text-slate-500">
        {ru.wallet.home.totalBalance}: {walletTotalBalanceRub.toLocaleString('ru-RU')} ₽
      </p>
    </div>
  )
}
