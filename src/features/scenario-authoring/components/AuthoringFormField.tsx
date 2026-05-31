import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const controlClass =
  'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100'

type BaseProps = {
  label: string
  hint?: string
}

export function AuthoringTextField({
  label,
  hint,
  className = '',
  ...inputProps
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input className={`${controlClass} ${className}`} {...inputProps} />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export function AuthoringTextArea({
  label,
  hint,
  className = '',
  rows = 3,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea className={`${controlClass} ${className}`} rows={rows} {...props} />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export function AuthoringSelect({
  label,
  hint,
  className = '',
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select className={`${controlClass} ${className}`} {...props}>
        {children}
      </select>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}
