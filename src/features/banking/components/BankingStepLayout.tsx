import type { ReactNode } from 'react'
import { BANKING_SCREEN_TITLES } from '../../../config/banking'
import type { BankingStepId } from '../../../types/bankingFlow'
import { Button } from '../../../components/ui/Button'
import { ru } from '../../../content/ru'

type BankingStepLayoutProps = {
  stepId: BankingStepId
  canGoBack?: boolean
  onBack?: () => void
  children: ReactNode
}

export function BankingStepLayout({
  stepId,
  canGoBack = false,
  onBack,
  children,
}: BankingStepLayoutProps) {
  const title = BANKING_SCREEN_TITLES[stepId] ?? stepId

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        {canGoBack && onBack ? (
          <Button variant="ghost" className="px-3" onClick={onBack}>
            {ru.buttons.back}
          </Button>
        ) : (
          <span className="w-11 sm:w-[72px]" />
        )}
        <h2 className="flex-1 text-lg font-semibold leading-snug text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}
