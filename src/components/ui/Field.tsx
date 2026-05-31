import type { InputHTMLAttributes, ReactNode } from 'react'

type FieldProps = {
  label: string
  hint?: string
  children?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export function Field({ label, hint, className = '', ...inputProps }: FieldProps) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 ${className}`}
        {...inputProps}
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}
