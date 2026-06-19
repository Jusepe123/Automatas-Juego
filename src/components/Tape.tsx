import { motion } from 'framer-motion'
import type { TmSymbol } from '../types'

interface Props {
  tape: TmSymbol[]
  head: number
}

/** Horizontal Turing-machine tape with an animated head marker. */
export function Tape({ tape, head }: Props) {
  return (
    <div className="overflow-x-auto pb-7 pt-1">
      <div className="relative flex min-w-max items-center gap-1.5 px-1">
        {tape.map((sym, i) => {
          const active = i === head
          const blank = sym === 'B'
          return (
            <div key={i} className="relative">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-md border text-lg transition-colors duration-200 ${
                  active
                    ? 'border-[rgb(var(--accent))] bg-accent/10 text-accent shadow-glow-soft'
                    : 'border-ink-600 bg-ink-900/60 text-slate-300'
                } ${blank && !active ? 'text-faint' : ''}`}
              >
                {sym}
              </div>
              {active && (
                <motion.div
                  layoutId="tm-head"
                  transition={{ type: 'spring', stiffness: 600, damping: 34 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-accent"
                >
                  <span className="block animate-pulse-soft text-xs">▲</span>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
