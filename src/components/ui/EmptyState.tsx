import type { ReactNode } from 'react'

type EmptyStateProps = {
  message: string
  children?: ReactNode
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-teal-50/40 px-5 py-8 text-center text-slate-600 sm:px-6 sm:py-10">
      <p className="text-sm leading-relaxed">{message}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
