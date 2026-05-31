import { Card } from '../../../components/ui/Card'
import { walletWarningTextByKey } from '../../../config/wallet'
import { ru } from '../../../content/ru'

type WalletWarningMessagesListProps = {
  warningKeys: string[]
}

export function WalletWarningMessagesList({ warningKeys }: WalletWarningMessagesListProps) {
  const messages = warningKeys
    .map((key) => walletWarningTextByKey(key))
    .filter((text): text is string => Boolean(text))

  return (
    <Card className="border-amber-200 bg-amber-50">
      <p className="mb-2 text-sm font-medium text-amber-950">{ru.wallet.screens.approvalWarning}</p>
      <ul className="list-disc space-y-2 pl-4 text-sm text-amber-900">
        {messages.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </Card>
  )
}
