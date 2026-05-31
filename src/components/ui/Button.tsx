import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-teal-700 text-white hover:bg-teal-800 focus-visible:outline-teal-500 disabled:bg-slate-300 disabled:text-slate-100',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
