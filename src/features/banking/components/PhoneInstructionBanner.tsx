import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'

export function PhoneInstructionBanner() {
  return (
    <Card className="mb-4 border-amber-200 bg-amber-50">
      <p className="text-sm text-amber-900">{ru.banking.newRecipient.phoneCallBanner}</p>
    </Card>
  )
}
