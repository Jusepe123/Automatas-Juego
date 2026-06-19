import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Optional small uppercase label rendered as a header chip. */
  label?: string
}

/** A framed terminal panel — the base surface for in-room content. */
export function Panel({ children, className = '', label }: Props) {
  return (
    <div className={`panel p-4 ${className}`}>
      {label && (
        <div className="mb-2 text-[0.6rem] uppercase tracking-[0.18em] text-faint">{label}</div>
      )}
      {children}
    </div>
  )
}
