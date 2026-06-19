import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel } from '../components/Panel'
import { Button } from '../components/Button'
import { RoomHeader } from '../components/RoomHeader'
import { SystemMessage, type Tone } from '../components/SystemMessage'
import { useGame } from '../state/gameStore'
import {
  PROBLEMS,
  DECIDABILITY_LABELS,
  DECIDABILITY_BLURB,
} from '../engines/decidability'
import type { Decidability } from '../types'

const CATEGORIES: Decidability[] = ['decidable', 'recognizable', 'undecidable']

export function OracleRoom() {
  const { addScore, recordError, useHint, completeRoom, startAttemptTimer, hintsUsed } =
    useGame()

  const [problemIdx, setProblemIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen] = useState<Decidability | null>(null)
  const [completed, setCompleted] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [hintUsedThisRoom, setHintUsedThisRoom] = useState(false)
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({
    tone: 'accent',
    text: 'Clasifica cada problema según su lugar en la jerarquía de computabilidad.',
  })

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const after = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

  useEffect(() => {
    startAttemptTimer()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync hintUsedThisRoom with global hintsUsed on mount
  useEffect(() => {
    if (hintsUsed >= 1) setHintUsedThisRoom(true)
  }, [hintsUsed])

  const problem = PROBLEMS[problemIdx]

  function classify(choice: Decidability) {
    if (answered || completed) return

    setChosen(choice)
    setAnswered(true)

    const isCorrect = choice === problem.answer
    const correctLabel = DECIDABILITY_LABELS[problem.answer]
    const chosenLabel = DECIDABILITY_LABELS[choice]

    if (isCorrect) {
      addScore(100)
      const next = correctCount + 1
      setCorrectCount(next)
      setMsg({
        tone: 'success',
        text: `✓ Correcto — ${correctLabel}. ${problem.explanation}`,
      })
    } else {
      recordError()
      addScore(-50)
      setMsg({
        tone: 'error',
        text: `✗ Incorrecto — Elegiste ${chosenLabel}. La respuesta es ${correctLabel}. ${problem.explanation}`,
      })
    }

    const isLast = problemIdx === PROBLEMS.length - 1

    if (isLast) {
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount
      setCompleted(true)
      after(() => {
        setMsg({
          tone: finalCorrect >= 5 ? 'success' : 'info',
          text: `Resultado final: ${finalCorrect}/${PROBLEMS.length} correctos. ¡Sala completada!`,
        })
      }, 400)
      after(() => completeRoom(2), 3000)
    } else {
      after(() => {
        setProblemIdx((i) => i + 1)
        setAnswered(false)
        setChosen(null)
        setHintVisible(false)
        setMsg({
          tone: 'accent',
          text: 'Clasifica el siguiente problema en la jerarquía.',
        })
      }, 3800)
    }
  }

  function revealHint() {
    if (hintUsedThisRoom || answered) return
    useHint()
    addScore(-10)
    setHintUsedThisRoom(true)
    setHintVisible(true)
  }

  function buttonClass(cat: Decidability): string {
    if (!answered || chosen === null) return ''
    const isChosen = chosen === cat
    const isCorrect = cat === problem.answer
    if (isCorrect) {
      return 'border-good text-good bg-good/10'
    }
    if (isChosen && !isCorrect) {
      return 'border-bad text-bad bg-bad/10'
    }
    return 'opacity-40'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <RoomHeader
        title="SALA 3 · EL ORÁCULO — DECIDIBILIDAD"
        subtitle="Clasifica cada problema según su lugar en la jerarquía: decidible · reconocible · irreconocible."
      />

      <div className="mb-4">
        <SystemMessage tone={msg.tone}>{msg.text}</SystemMessage>
      </div>

      {/* Progress bar */}
      <div className="mb-4 flex items-center justify-between font-mono text-xs text-faint">
        <span>
          Problema{' '}
          <span className="text-accent">{Math.min(problemIdx + 1, PROBLEMS.length)}</span>{' '}
          de {PROBLEMS.length}
        </span>
        <span>
          Correctos:{' '}
          <span className="text-good">{correctCount}</span>
          <span className="text-faint">/{PROBLEMS.length}</span>
        </span>
      </div>

      {/* Problem card with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {!completed && (
          <motion.div
            key={problemIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Panel className="mb-4">
              {/* Problem tag / identifier */}
              <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-faint">
                Problema {problemIdx + 1} de {PROBLEMS.length}
                <span className="mx-2">·</span>
                <span className="text-accent">{problem.tag}</span>
              </div>

              {/* Problem text */}
              <p className="mb-5 text-sm leading-relaxed text-slate-200 sm:text-base">
                {problem.text}
              </p>

              {/* Classification buttons */}
              <div className="flex flex-col gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => classify(cat)}
                    disabled={answered}
                    className={`w-full rounded-md border bg-transparent px-4 py-3 text-left font-mono text-sm transition-all duration-200 cursor-pointer
                      disabled:cursor-not-allowed
                      ${
                        answered
                          ? buttonClass(cat)
                          : 'border-ink-500 text-accent hover:border-accent hover:bg-accent/10'
                      }
                    `}
                  >
                    <div className="font-semibold uppercase tracking-wider">
                      {DECIDABILITY_LABELS[cat]}
                    </div>
                    <div className="mt-0.5 text-xs font-normal normal-case tracking-normal text-muted">
                      {DECIDABILITY_BLURB[cat]}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint area */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          onClick={revealHint}
          disabled={hintUsedThisRoom || answered}
        >
          [?] PISTA
        </Button>
        {hintUsedThisRoom && !hintVisible && (
          <span className="font-mono text-xs text-faint">Pista ya utilizada (−10 pts)</span>
        )}
        {!hintUsedThisRoom && (
          <span className="font-mono text-xs text-faint">1 pista disponible para toda la sala</span>
        )}
      </div>

      {/* Hint panel */}
      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-4 overflow-hidden"
          >
            <SystemMessage tone="info">
              💡 Pista (−10 pts): {problem.hint}
            </SystemMessage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed final message */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <Panel label="Sala completada">
              <p className="font-mono text-sm text-good">
                Has clasificado los 7 problemas de computabilidad. Redirigiendo…
              </p>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
