import type { ReactNode } from 'react'

type PageSectionProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function PageSection({ title, description, children, className = '' }: PageSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {title ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
