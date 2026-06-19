import { AnimatePresence, motion } from 'framer-motion'
import { BOTTOM } from '../engines/pda'

interface Props {
  /** Stack with bottom marker at index 0; rendered bottom-up visually. */
  stack: string[]
}

/** Vertical stack column with animated push/pop. Top of stack is at the top. */
export function Stack({ stack }: Props) {
  // Render top-first (reverse) so the visual top sits at the top of the column.
  const top = stack.length - 1
  return (
    <div className="flex flex-col items-stretch gap-1.5 rounded-lg border border-ink-600 bg-ink-900/70 p-2">
      <AnimatePresence initial={false} mode="popLayout">
        {[...stack]
          .map((sym, i) => ({ sym, i }))
          .reverse()
          .map(({ sym, i }) => {
            const isBottom = sym === BOTTOM
            const isTop = i === top
            return (
              <motion.div
                key={`${i}-${sym}`}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`flex h-9 items-center justify-center rounded-md border text-sm font-semibold ${
                  isBottom
                    ? 'border-ink-500 bg-ink-700/60 text-faint'
                    : isTop
                      ? 'border-[rgb(var(--accent))] bg-accent/10 text-accent shadow-glow-soft'
                      : 'border-[rgb(var(--accent))]/40 bg-accent/[0.04] text-accent/80'
                }`}
              >
                {sym}
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}
