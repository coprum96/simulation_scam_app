import type { ReactNode } from 'react'
import { WALLET_SCREEN_TITLES } from '../../../config/wallet'
import type { WalletStepId } from '../../../types/walletFlow'
import { Button } from '../../../components/ui/Button'
import { ru } from '../../../content/ru'

type WalletStepLayoutProps = {
  stepId: WalletStepId
  canGoBack?: boolean
  onBack?: () => void
  children: ReactNode
}

export function WalletStepLayout({
  stepId,
  canGoBack = false,
  onBack,
  children,
}: WalletStepLayoutProps) {
  const title = WALLET_SCREEN_TITLES[stepId] ?? stepId

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
