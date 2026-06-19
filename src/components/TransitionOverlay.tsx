import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGame } from '../state/gameStore'
import type { RoomId } from '../types'

const LABELS: Record<RoomId | 'victory', { title: string; sub: string }> = {
  0: { title: 'INICIALIZANDO · SALA 1', sub: 'Montando autómata con pila…' },
  1: { title: 'CARGANDO · SALA 2', sub: 'Calibrando cinta y cabezal…' },
  2: { title: 'CONECTANDO · SALA 3', sub: 'Estableciendo enlace con el Oráculo…' },
  victory: { title: 'COMPILANDO SALIDA', sub: 'Verificando prueba de escape…' },
}

/** Full-screen loader shown while moving between rooms / to victory. */
export function TransitionOverlay() {
  const transition = useGame((s) => s.transition)
  const finishTransition = useGame((s) => s.finishTransition)
  const [pct, setPct] = useState(0)

  const active = !!transition?.active
  const to = transition?.to ?? 0

  useEffect(() => {
    if (!active) return
    setPct(0)
    let p = 0
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random() * 16 + 7)
      setPct(p)
      if (p >= 100) {
        clearInterval(iv)
        setTimeout(finishTransition, 320)
      }
    }, 110)
    return () => clearInterval(iv)
  }, [active, finishTransition])

  const meta = LABELS[to]

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-900/96 backdrop-blur"
        >
          <div className="font-mono text-sm uppercase tracking-[0.25em] text-accent">
            {meta.title}
          </div>
          <div className="mt-4 h-1 w-72 max-w-[70vw] overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full bg-[rgb(var(--accent))] transition-[width] duration-150 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 text-xs text-faint">{meta.sub}</div>
          <div className="mt-1 font-mono text-xs tabular-nums text-faint">
            {Math.floor(pct)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
