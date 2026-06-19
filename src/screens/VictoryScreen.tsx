import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { useGame } from '../state/gameStore'

const BANNER = String.raw`
██╗      ██╗ ██████╗  ██████╗  ███████╗
██║      ██║ ██╔══██╗ ██╔══██╗ ██╔════╝
██║      ██║ ██████╔╝ ██████╔╝ █████╗
██║      ██║ ██╔══██╗ ██╔══██╗ ██╔══╝
███████╗ ██║ ██████╔╝ ██║  ██║ ███████╗
╚══════╝ ╚═╝ ╚═════╝  ╚═╝  ╚═╝ ╚══════╝`

function getRank(score: number): string {
  if (score >= 3000) return 'Maestro de Turing'
  if (score >= 2000) return 'Experto en Computabilidad'
  if (score >= 1000) return 'Ingeniero de Lenguajes'
  if (score >= 500) return 'Técnico en Autómatas'
  return 'Aprendiz'
}

function formatElapsed(startTime: number | null): string {
  if (startTime === null) return '—'
  const elapsed = Math.max(0, Date.now() - startTime)
  const totalSeconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function VictoryScreen() {
  const score = useGame((s) => s.score)
  const highScore = useGame((s) => s.highScore)
  const newHigh = useGame((s) => s.newHigh)
  const totalErrors = useGame((s) => s.totalErrors)
  const startTime = useGame((s) => s.startTime)
  const resetGame = useGame((s) => s.resetGame)

  const rank = getRank(score)
  const elapsed = formatElapsed(startTime)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <motion.div
        className="scanlines w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-800/50 p-8 backdrop-blur-sm sm:p-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Gradient top rule */}
        <div className="-mt-2 h-px w-full bg-gradient-to-r from-transparent via-[rgb(var(--accent))] to-transparent" />

        {/* ASCII banner */}
        <motion.pre
          variants={itemVariants}
          className="mt-6 overflow-x-auto text-[0.45rem] leading-[1.15] text-accent sm:text-[0.55rem] md:text-[0.63rem]"
        >
          {BANNER}
        </motion.pre>

        {/* Main heading */}
        <motion.div variants={itemVariants} className="mt-7">
          <p className="text-xs text-faint">
            &gt; PROTOCOLO DE ESCAPE // ESTADO:{' '}
            <span className="text-good">COMPLETADO</span>
          </p>
          <h1 className="mt-2 font-mono text-2xl font-semibold tracking-widest text-slate-200 sm:text-3xl">
            ESCAPE EXITOSO
          </h1>
          <p className="mt-1 font-mono text-sm tracking-[0.2em] text-accent">
            RANGO: {rank}
          </p>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          variants={itemVariants}
          className="mt-7 rounded-xl border border-ink-600/70 bg-ink-900/60 p-5 backdrop-blur-sm"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-faint">
            Resumen de partida
          </p>
          <ul className="space-y-2 font-mono text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted">Puntaje total</span>
              <span className="text-accent font-medium">{score.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">Tiempo total</span>
              <span className="text-slate-200">{elapsed}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">Errores cometidos</span>
              <span className={totalErrors === 0 ? 'text-good' : 'text-warn'}>
                {totalErrors}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">Salas completadas</span>
              <span className="text-good">3 / 3</span>
            </li>
            <li className="flex items-center justify-between border-t border-ink-600/50 pt-2">
              <span className="text-muted">Récord</span>
              <span className="text-slate-200">
                {highScore.toLocaleString()}
                {newHigh && (
                  <span className="ml-2 text-warn text-xs">← ¡NUEVO!</span>
                )}
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Concepts summary */}
        <motion.div
          variants={itemVariants}
          className="mt-6 space-y-2 text-xs leading-relaxed text-muted"
        >
          <p>
            Has demostrado dominio sobre tres modelos formales de la jerarquía de Chomsky:
            el <span className="text-pda">autómata con pila</span> para reconocer{' '}
            <span className="text-faint">L = {'{ aⁿbⁿ }'}</span>, y la{' '}
            <span className="text-tm">máquina de Turing</span> para decidir{' '}
            <span className="text-faint">L = {'{ 0ⁿ1ⁿ }'}</span>.
          </p>
          <p>
            Finalmente, navegaste la frontera de la{' '}
            <span className="text-oracle">decidibilidad</span>: comprendiste qué problemas
            pueden resolverse algorítmicamente y cuáles —como el problema de la
            detención— escapan para siempre a toda máquina.
          </p>
        </motion.div>

        {/* Terminal flavor line */}
        <motion.div
          variants={itemVariants}
          className="mt-7 border-t border-ink-700 pt-5 text-xs text-faint"
        >
          <span className="text-accent">usuario@maquina</span>:~$ ./escape --completado{' '}
          <span className="animate-caret-blink">▌</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-7 flex flex-col items-center gap-3"
        >
          <Button variant="primary" onClick={resetGame}>
            Volver al inicio
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
