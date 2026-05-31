import type { ReactNode } from 'react'

type GovernanceAccessBannerProps = {
  children: ReactNode
  tone?: 'info' | 'warning'
}

export function GovernanceAccessBanner({
  children,
  tone = 'info',
}: GovernanceAccessBannerProps) {
  const className =
    tone === 'warning'
      ? 'mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'
      : 'mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'

  return <p className={className}>{children}</p>
}
