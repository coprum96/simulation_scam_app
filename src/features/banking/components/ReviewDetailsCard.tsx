import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import { useBankingFlowStore } from '../bankingFlowStore'

export function ReviewDetailsCard() {
  const form = useBankingFlowStore((s) => s.form)

  return (
    <Card className="space-y-2 text-sm">
      <p className="font-medium text-slate-900">{ru.banking.review.title}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">{ru.banking.review.recipient}</span>
        <span className="text-right text-slate-900">{form.recipientName}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">{ru.banking.fields.recipientBank}</span>
        <span className="text-right text-slate-900">{form.recipientBank || ru.banking.review.noComment}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">{ru.banking.fields.recipientAccount}</span>
        <span className="text-right font-mono text-xs text-slate-900">{form.recipientAccount}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">{ru.banking.review.amount}</span>
        <span className="text-slate-900">
          {Number(form.amount || 0).toLocaleString('ru-RU')} ₽
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">{ru.banking.review.comment}</span>
        <span className="text-slate-900">{form.comment || ru.banking.review.noComment}</span>
      </div>
    </Card>
  )
}
