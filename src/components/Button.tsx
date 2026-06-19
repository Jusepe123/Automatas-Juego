import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'action' | 'ghost' | 'danger' | 'good'

const VARIANTS: Record<Variant, string> = {
  // Big call-to-action (start / restart). Uses accent.
  primary:
    'border-2 border-accent text-accent px-10 py-3.5 text-base tracking-[0.25em] hover:bg-accent hover:text-ink-900 hover:shadow-glow',
  // In-room action buttons (push/pop/execute…). Uses accent on hover.
  action:
    'border border-ink-500 text-accent px-5 py-2.5 hover:border-accent hover:bg-accent/10 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-ink-500 disabled:hover:bg-transparent',
  ghost:
    'border border-ink-600 text-muted px-4 py-2 hover:border-ink-500 hover:text-slate-200',
  danger:
    'border border-bad/60 text-bad px-5 py-2.5 hover:bg-bad/10 disabled:opacity-25 disabled:cursor-not-allowed',
  good: 'border border-good/60 text-good px-5 py-2.5 hover:bg-good/10 disabled:opacity-25 disabled:cursor-not-allowed',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'action', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`font-mono uppercase text-sm font-medium tracking-wider rounded-md bg-transparent cursor-pointer transition-all duration-200 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
