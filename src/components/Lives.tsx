import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  current: number
  max?: number
}

/** Heart row for the current room's remaining lives. */
export function Lives({ current, max = 5 }: Props) {
  return (
    <div className="flex items-center justify-end gap-1.5" aria-label={`${current} de ${max} vidas`}>
      {Array.from({ length: max }).map((_, i) => {
        const alive = i < current
        return (
          <AnimatePresence mode="popLayout" key={i}>
            <motion.span
              initial={false}
              animate={{
                scale: alive ? 1 : 0.78,
                opacity: alive ? 1 : 0.22,
                filter: alive ? 'grayscale(0)' : 'grayscale(1)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`text-lg leading-none ${alive ? 'text-bad' : 'text-faint'}`}
            >
              {alive ? '♥' : '♡'}
            </motion.span>
          </AnimatePresence>
        )
      })}
    </div>
  )
}
