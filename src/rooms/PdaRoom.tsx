import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel } from '../components/Panel'
import { Button } from '../components/Button'
import { Stack } from '../components/Stack'
import { RoomHeader } from '../components/RoomHeader'
import { SystemMessage, type Tone } from '../components/SystemMessage'
import { TestStringPicker } from '../components/TestStringPicker'
import { useGame } from '../state/gameStore'
import {
  PDA_RULES,
  PDA_TEST_STRINGS,
  applyAction,
  correctAction,
  currentSymbol,
  explanation,
  initPda,
  stackTop,
  transitionLabel,
} from '../engines/pda'
import type { PdaAction, PdaConfig } from '../types'

interface TraceLine {
  text: string
  tone: 'ok' | 'bad' | 'note'
}

export function PdaRoom() {
  const { lives, loseLife, refillLives, addScore, recordError, completeRoom, startAttemptTimer, claimSpeedBonus } =
    useGame()
  const roomLives = lives[0]

  const [config, setConfig] = useState<PdaConfig>(() => initPda('aabb'))
  const [selected, setSelected] = useState('aabb')
  const [done, setDone] = useState<Set<string>>(new Set())
  const [trace, setTrace] = useState<TraceLine[]>([])
  const [explain, setExplain] = useState(false)
  const [locked, setLocked] = useState(false)
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({
    tone: 'accent',
    text: 'Autómata con pila listo. Elige una acción para cada paso.',
  })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const after = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

  useEffect(() => {
    startAttemptTimer()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadString(value: string) {
    setSelected(value)
    if (done.has(value)) {
      setLocked(true)
      setMsg({ tone: 'info', text: 'Cadena ya resuelta. Selecciona otra.' })
      return
    }
    setConfig(initPda(value))
    setTrace([])
    setLocked(false)
    setMsg({ tone: 'accent', text: 'Elige la transición correcta para el paso actual.' })
    startAttemptTimer()
  }

  function markDone(value: string, verdict: 'accept' | 'reject') {
    const nextDone = new Set(done).add(value)
    setDone(nextDone)
    const bonus = claimSpeedBonus()
    setTrace((t) => [
      ...t,
      { text: `▸ Cadena «${value}» ${verdict === 'accept' ? 'ACEPTADA' : 'RECHAZADA'}.`, tone: verdict === 'accept' ? 'ok' : 'bad' },
      ...(bonus ? [{ text: `⏱ +${bonus} pts por velocidad (<30s).`, tone: 'ok' as const }] : []),
    ])

    if (nextDone.size >= PDA_TEST_STRINGS.length) {
      setMsg({ tone: 'success', text: '✓ SALA 1 COMPLETADA. Has dominado el autómata con pila.' })
      after(() => completeRoom(0), 1900)
    } else {
      const next = PDA_TEST_STRINGS.find((s) => !nextDone.has(s.value))
      setMsg({ tone: 'success', text: `✓ Correcto. ${next ? 'Selecciona la siguiente cadena.' : ''}` })
      if (next) after(() => loadString(next.value), 1200)
    }
  }

  function act(action: PdaAction) {
    if (locked || config.done) return
    const right = correctAction(config)

    if (action !== right) {
      recordError()
      addScore(-50)
      const remaining = loseLife(0)
      setLocked(true)
      setMsg({
        tone: 'error',
        text: `✗ Incorrecto. La transición correcta es: ${transitionLabel(config, right)}`,
      })
      setTrace((t) => [
        ...t,
        { text: `✗ Elegiste ${action.toUpperCase()}; lo correcto era ${right.toUpperCase()}.`, tone: 'bad' },
        ...(explain ? [{ text: `📘 ${explanation(right)}`, tone: 'note' as const }] : []),
      ])
      if (remaining <= 0) {
        setMsg({ tone: 'error', text: 'Vidas agotadas. Reiniciando la cadena…' })
        after(() => {
          refillLives(0)
          setConfig(initPda(selected))
          setTrace([])
          setLocked(false)
          setMsg({ tone: 'accent', text: 'Nuevo intento. Elige la transición correcta.' })
          startAttemptTimer()
        }, 1900)
      } else {
        after(() => {
          setConfig(initPda(selected))
          setTrace([])
          setLocked(false)
          setMsg({ tone: 'accent', text: 'Intenta de nuevo desde el inicio de la cadena.' })
          startAttemptTimer()
        }, 1700)
      }
      return
    }

    // Correct
    addScore(100)
    setTrace((t) => [
      ...t,
      { text: `✓ ${transitionLabel(config, action)}`, tone: 'ok' },
      ...(explain ? [{ text: `📘 ${explanation(action)}`, tone: 'note' as const }] : []),
    ])

    const { next } = applyAction(config, action)
    setConfig(next)

    if (next.done && next.result) {
      setLocked(true)
      markDone(selected, next.result)
    } else {
      setMsg({ tone: 'accent', text: '✓ Correcto. Continúa con el siguiente paso.' })
    }
  }

  const sym = currentSymbol(config)
  const top = stackTop(config) ?? '∅'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <RoomHeader
        title="SALA 1 · LA PILA — AUTÓMATA CON PILA"
        subtitle="L = { aⁿbⁿ | n ≥ 1 }   //   apila cada a, desapila con cada b, acepta con la pila vacía."
        lives={roomLives}
      />

      <div className="mb-4">
        <SystemMessage tone={msg.tone}>{msg.text}</SystemMessage>
      </div>

      <div className="mb-4">
        <TestStringPicker items={PDA_TEST_STRINGS} selected={selected} done={done} onSelect={loadString} />
      </div>

      {/* Input tape readout */}
      <div className="mb-4 font-mono text-base">
        <span className="text-faint">entrada: </span>
        <span className="text-faint line-through">{config.input.slice(0, config.pos)}</span>
        {config.pos < config.input.length ? (
          <span className="rounded bg-accent px-1.5 py-0.5 font-semibold text-ink-900">
            {config.input[config.pos]}
          </span>
        ) : null}
        <span className="text-accent">{config.input.slice(config.pos + 1)}</span>
        {config.pos >= config.input.length && <span className="text-warn"> ▐FIN▐</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-[150px_1fr]">
        {/* Stack column */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[0.6rem] uppercase tracking-[0.15em] text-faint">Pila</span>
            <span className="font-mono text-xs text-faint">[{config.stack.length}]</span>
          </div>
          <Stack stack={config.stack} />
        </div>

        {/* Info + actions */}
        <div className="space-y-3">
          <Panel label="Función de transición δ">
            <div className="space-y-1 font-mono text-xs leading-relaxed">
              {PDA_RULES.map((r) => (
                <div key={r.lhs} className="text-muted">
                  <span className="text-accent">{r.lhs}</span> = {r.rhs}{' '}
                  <span className="text-faint">— {r.note}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Configuración actual">
            <div className="font-mono text-sm">
              estado <span className="text-accent">{config.state}</span>
              <span className="mx-2 text-faint">·</span>
              símbolo <span className="text-accent">{sym}</span>
              <span className="mx-2 text-faint">·</span>
              tope <span className="text-accent">{top}</span>
            </div>
          </Panel>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => act('push')} disabled={locked || config.done}>
              Push a
            </Button>
            <Button onClick={() => act('pop')} disabled={locked || config.done}>
              Pop
            </Button>
            <Button variant="good" onClick={() => act('accept')} disabled={locked || config.done}>
              Aceptar
            </Button>
            <Button variant="danger" onClick={() => act('reject')} disabled={locked || config.done}>
              Rechazar
            </Button>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={explain}
              onChange={(e) => setExplain(e.target.checked)}
              className="h-3.5 w-3.5 accent-[rgb(var(--accent))]"
            />
            Modo explicación formal
          </label>
        </div>
      </div>

      {/* Trace log */}
      <Panel label="Traza" className="mt-4 max-h-40 overflow-y-auto">
        {trace.length === 0 ? (
          <p className="font-mono text-xs text-faint">▸ Esperando la primera acción…</p>
        ) : (
          <div className="space-y-1 font-mono text-xs leading-relaxed">
            <AnimatePresence initial={false}>
              {trace.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    l.tone === 'ok' ? 'text-good' : l.tone === 'bad' ? 'text-bad' : 'italic text-tm'
                  }
                >
                  {l.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Panel>
    </motion.div>
  )
}
