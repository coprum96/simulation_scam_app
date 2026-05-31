import type { ReactNode } from 'react'

type ResearcherHintProps = {
  children: ReactNode
  tone?: 'info' | 'muted'
}

export function ResearcherHint({ children, tone = 'info' }: ResearcherHintProps) {
  const toneClass =
    tone === 'muted'
      ? 'border-slate-200/90 bg-slate-50/80 text-slate-600'
      : 'border-teal-100 bg-teal-50/50 text-slate-700'

  return (
    <p
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed sm:mb-6 ${toneClass}`}
    >
      {children}
    </p>
  )
}
