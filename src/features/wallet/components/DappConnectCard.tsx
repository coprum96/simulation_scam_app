import type { MockDapp } from '../../../data/mockDapps'
import { ru } from '../../../content/ru'
import { Card } from '../../../components/ui/Card'

type DappConnectCardProps = {
  dapp: MockDapp
  showFakeAlert?: boolean
}

export function DappConnectCard({ dapp, showFakeAlert }: DappConnectCardProps) {
  return (
    <Card>
      <p className="font-medium text-slate-900">{dapp.name}</p>
      <p className="text-sm text-slate-600">{dapp.description}</p>
      <p className="mt-1 font-mono text-xs text-slate-500">{dapp.address}</p>
      {showFakeAlert ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-900">
          {ru.wallet.connect.fakeAlert}
        </p>
      ) : null}
    </Card>
  )
}
