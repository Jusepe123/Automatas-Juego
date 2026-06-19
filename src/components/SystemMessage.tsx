import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

export type Tone = 'info' | 'accent' | 'error' | 'success'

const TONES: Record<Tone, string> = {
  info: 'border-l-ink-500 text-muted',
  accent: 'border-l-[rgb(var(--accent))] text-accent',
  error: 'border-l-bad text-bad',
  success: 'border-l-good text-good',
}

interface Props {
  tone?: Tone
  children: ReactNode
}

/** A console-style status line. Animates a quick flash when content changes. */
export function SystemMessage({ tone = 'info', children }: Props) {
  return (
    <motion.div
      key={String(children)}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`min-h-[2.75rem] rounded-r-md border-l-2 bg-ink-900/50 px-3.5 py-2.5 text-sm leading-relaxed ${TONES[tone]}`}
    >
      {children}
    </motion.div>
  )
}
