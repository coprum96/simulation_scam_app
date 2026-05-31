import { Card } from '../../../components/ui/Card'
import { warningTextByKey } from '../../../config/banking'
import { ru } from '../../../content/ru'

type WarningMessagesListProps = {
  warningKeys: string[]
}

export function WarningMessagesList({ warningKeys }: WarningMessagesListProps) {
  const messages = warningKeys
    .map((key) => warningTextByKey(key))
    .filter((text): text is string => Boolean(text))

  return (
    <Card className="border-amber-200 bg-amber-50">
      <p className="mb-2 text-sm font-medium text-amber-950">{ru.banking.screens.warning}</p>
      <ul className="list-disc space-y-2 pl-4 text-sm text-amber-900">
        {messages.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </Card>
  )
}
