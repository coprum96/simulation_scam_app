import type { ReactNode } from 'react'

type GuidedEmptyStateProps = {
  title: string
  message: string
  steps?: readonly string[]
  children?: ReactNode
}

export function GuidedEmptyState({ title, message, steps, children }: GuidedEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-8 sm:py-10">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{message}</p>
      {steps && steps.length > 0 ? (
        <ol className="mx-auto mt-5 max-w-md space-y-2 text-left text-sm text-slate-700">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  )
}
