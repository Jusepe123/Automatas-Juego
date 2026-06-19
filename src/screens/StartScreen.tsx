import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { useGame } from '../state/gameStore'

const TITLE = String.raw`
 ████████╗██╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗ ███████╗
 ╚══██╔══╝██║   ██║██╔══██╗██║████╗  ██║██╔════╝ ██╔════╝
    ██║   ██║   ██║██████╔╝██║██╔██╗ ██║██║  ███╗███████╗
    ██║   ██║   ██║██╔══██╗██║██║╚██╗██║██║   ██║╚════██║
    ██║   ╚██████╔╝██║  ██║██║██║ ╚████║╚██████╔╝███████║
    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
            E  S  C  A  P  E`

export function StartScreen() {
  const startGame = useGame((s) => s.startGame)
  const highScore = useGame((s) => s.highScore)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="scanlines w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-800/50 p-8 backdrop-blur-sm sm:p-10">
        <div className="-mt-2 h-px w-full bg-gradient-to-r from-transparent via-[rgb(var(--accent))] to-transparent" />

        <pre className="mt-6 overflow-x-auto text-[0.5rem] leading-[1.15] text-accent sm:text-[0.62rem] md:text-[0.72rem]">
          {TITLE}
        </pre>

        <div className="mt-7 space-y-3 text-sm leading-relaxed text-slate-300">
          <p className="text-xs text-faint">
            &gt; SISTEMA INICIADO // ESTADO: <span className="text-warn">CRÍTICO</span>
          </p>
          <p>
            Estás atrapado dentro de la{' '}
            <span className="text-accent">Máquina Universal de Turing</span>. Para escapar debes
            demostrar que comprendes las reglas que gobiernan toda la computación.
          </p>
          <p className="text-muted">
            Tres salas. Tres modelos formales. Cada error drena tu energía.
          </p>

          <ul className="space-y-1 pt-1 text-xs text-muted">
            <li>
              <span className="text-pda">■</span> Sala 1 — Autómata con Pila
              <span className="text-faint"> · L = {'{ aⁿbⁿ }'}</span>
            </li>
            <li>
              <span className="text-tm">■</span> Sala 2 — Máquina de Turing
              <span className="text-faint"> · L = {'{ 0ⁿ1ⁿ }'}</span>
            </li>
            <li>
              <span className="text-oracle">■</span> Sala 3 — Decidibilidad y jerarquía
            </li>
          </ul>
        </div>

        <div className="mt-7 border-t border-ink-700 pt-5 text-xs text-faint">
          <span className="text-accent">usuario@maquina</span>:~$ ./escape --iniciar
          <span className="animate-caret-blink">▌</span>
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <Button variant="primary" onClick={startGame}>
            Iniciar escape
          </Button>
          {highScore > 0 && (
            <p className="text-xs text-faint">
              Récord personal: <span className="text-slate-300">{highScore.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
