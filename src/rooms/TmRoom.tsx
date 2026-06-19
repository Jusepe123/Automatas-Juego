import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel } from '../components/Panel'
import { Button } from '../components/Button'
import { Tape } from '../components/Tape'
import { RoomHeader } from '../components/RoomHeader'
import { SystemMessage, type Tone } from '../components/SystemMessage'
import { TestStringPicker } from '../components/TestStringPicker'
import { useGame } from '../state/gameStore'
import {
  TM_RULE_ROWS,
  TM_TEST_STRINGS,
  TM_SYMBOLS,
  TM_STATES,
  initTm,
  readSymbol,
  lookup,
  instantaneousDescription,
  applyTransition,
  rejectTransition,
} from '../engines/tm'
import type { TmConfig, TmDir, TmState, TmSymbol } from '../types'

interface TraceLine {
  text: string
  tone: 'ok' | 'bad' | 'note'
}

function defaultSelects(config: TmConfig): { write: TmSymbol; dir: TmDir; next: TmState } {
  const exp = lookup(config)
  if (exp) return { write: exp.write, dir: exp.dir, next: exp.next }
  const rt = rejectTransition(config)
  return { write: rt.write, dir: rt.dir, next: rt.next }
}

export function TmRoom() {
  const { lives, loseLife, refillLives, addScore, recordError, completeRoom, startAttemptTimer, claimSpeedBonus } =
    useGame()
  const roomLives = lives[1]

  const [config, setConfig] = useState<TmConfig>(() => initTm('01'))
  const [selected, setSelected] = useState('01')
  const [done, setDone] = useState<Set<string>>(new Set())
  const [trace, setTrace] = useState<TraceLine[]>([])
  const [locked, setLocked] = useState(false)
  const [msg, setMsg] = useState<{ tone: Tone; text: string }>({
    tone: 'accent',
    text: 'Máquina de Turing lista. Elige escritura, dirección y estado para cada paso.',
  })

  // Controlled selects
  const [selWrite, setSelWrite] = useState<TmSymbol>(() => defaultSelects(initTm('01')).write)
  const [selDir, setSelDir] = useState<TmDir>(() => defaultSelects(initTm('01')).dir)
  const [selNext, setSelNext] = useState<TmState>(() => defaultSelects(initTm('01')).next)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const after = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

  useEffect(() => {
    startAttemptTimer()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetSelects(cfg: TmConfig) {
    const d = defaultSelects(cfg)
    setSelWrite(d.write)
    setSelDir(d.dir)
    setSelNext(d.next)
  }

  function loadString(value: string) {
    setSelected(value)
    if (done.has(value)) {
      setLocked(true)
      setMsg({ tone: 'info', text: 'Cadena ya resuelta. Selecciona otra.' })
      return
    }
    const cfg = initTm(value)
    setConfig(cfg)
    setTrace([])
    setLocked(false)
    resetSelects(cfg)
    setMsg({ tone: 'accent', text: 'Elige la transición correcta para el paso actual.' })
    startAttemptTimer()
  }

  function markDone(value: string, verdict: 'accept' | 'reject') {
    const nextDone = new Set(done).add(value)
    setDone(nextDone)
    const bonus = claimSpeedBonus()
    setTrace((t) => [
      ...t,
      {
        text: `▸ Cadena «${value}» ${verdict === 'accept' ? 'ACEPTADA' : 'RECHAZADA'}.`,
        tone: verdict === 'accept' ? 'ok' : 'bad',
      },
      ...(bonus ? [{ text: `⏱ +${bonus} pts por velocidad (<30s).`, tone: 'ok' as const }] : []),
    ])

    if (nextDone.size >= TM_TEST_STRINGS.length) {
      setMsg({ tone: 'success', text: '✓ SALA 2 COMPLETADA. Has dominado la Máquina de Turing.' })
      after(() => completeRoom(1), 1900)
    } else {
      const next = TM_TEST_STRINGS.find((s) => !nextDone.has(s.value))
      setMsg({ tone: 'success', text: `✓ Correcto. ${next ? 'Selecciona la siguiente cadena.' : ''}` })
      if (next) after(() => loadString(next.value), 1200)
    }
  }

  function executeStep() {
    if (locked || config.done) return

    const sym = readSymbol(config)
    const expected = lookup(config)
    const playerMove = { write: selWrite, dir: selDir, next: selNext }

    if (expected === null) {
      // Only correct move is to reject (qR)
      const rt = rejectTransition(config)
      const isCorrect = playerMove.write === rt.write && playerMove.dir === rt.dir && playerMove.next === rt.next
      if (!isCorrect) {
        // Wrong: they should have picked the reject transition
        recordError()
        addScore(-50)
        const remaining = loseLife(1)
        setLocked(true)
        setMsg({
          tone: 'error',
          text: `✗ Incorrecto. No hay transición definida para δ(${config.state},${sym}). La única opción es rechazar (qR).`,
        })
        setTrace((t) => [
          ...t,
          {
            text: `✗ δ(${config.state},${sym}) indefinida → correcto era (${rt.next},${rt.write},${rt.dir}).`,
            tone: 'bad',
          },
        ])
        if (remaining <= 0) {
          setMsg({ tone: 'error', text: 'Vidas agotadas. Reiniciando la cadena…' })
          after(() => {
            refillLives(1)
            const cfg = initTm(selected)
            setConfig(cfg)
            setTrace([])
            setLocked(false)
            resetSelects(cfg)
            setMsg({ tone: 'accent', text: 'Nuevo intento. Elige la transición correcta.' })
            startAttemptTimer()
          }, 1900)
        } else {
          after(() => {
            const cfg = initTm(selected)
            setConfig(cfg)
            setTrace([])
            setLocked(false)
            resetSelects(cfg)
            setMsg({ tone: 'accent', text: 'Intenta de nuevo desde el inicio de la cadena.' })
            startAttemptTimer()
          }, 1700)
        }
        return
      }
      // Correct: apply reject transition
      addScore(100)
      const next = applyTransition(config, rt)
      setTrace((t) => [
        ...t,
        { text: `✓ δ(${config.state},${sym}) indefinida → (${rt.next},${rt.write},${rt.dir}) — rechazar.`, tone: 'ok' },
      ])
      setConfig(next)
      resetSelects(next)
      if (next.done && next.result) {
        setLocked(true)
        markDone(selected, next.result)
      } else {
        setMsg({ tone: 'accent', text: '✓ Correcto. Continúa con el siguiente paso.' })
      }
      return
    }

    // There IS a defined transition — compare player's choice
    const isCorrect =
      playerMove.write === expected.write && playerMove.dir === expected.dir && playerMove.next === expected.next

    if (!isCorrect) {
      recordError()
      addScore(-50)
      const remaining = loseLife(1)
      setLocked(true)
      setMsg({
        tone: 'error',
        text: `✗ Incorrecto. δ(${config.state},${sym}) = (${expected.next},${expected.write},${expected.dir})`,
      })
      setTrace((t) => [
        ...t,
        {
          text: `✗ Elegiste (${playerMove.next},${playerMove.write},${playerMove.dir}); correcto: δ(${config.state},${sym})=(${expected.next},${expected.write},${expected.dir}).`,
          tone: 'bad',
        },
      ])
      if (remaining <= 0) {
        setMsg({ tone: 'error', text: 'Vidas agotadas. Reiniciando la cadena…' })
        after(() => {
          refillLives(1)
          const cfg = initTm(selected)
          setConfig(cfg)
          setTrace([])
          setLocked(false)
          resetSelects(cfg)
          setMsg({ tone: 'accent', text: 'Nuevo intento. Elige la transición correcta.' })
          startAttemptTimer()
        }, 1900)
      } else {
        after(() => {
          const cfg = initTm(selected)
          setConfig(cfg)
          setTrace([])
          setLocked(false)
          resetSelects(cfg)
          setMsg({ tone: 'accent', text: 'Intenta de nuevo desde el inicio de la cadena.' })
          startAttemptTimer()
        }, 1700)
      }
      return
    }

    // Correct
    addScore(100)
    const next = applyTransition(config, expected)
    setTrace((t) => [
      ...t,
      { text: `✓ δ(${config.state},${sym}) = (${expected.next},${expected.write},${expected.dir})`, tone: 'ok' },
    ])
    setConfig(next)
    resetSelects(next)

    if (next.done && next.result) {
      setLocked(true)
      markDone(selected, next.result)
    } else {
      setMsg({ tone: 'accent', text: '✓ Correcto. Continúa con el siguiente paso.' })
    }
  }

  function handleReject() {
    if (locked || config.done) return
    const exp = lookup(config)
    if (exp !== null) {
      setMsg({ tone: 'error', text: 'Hay una transición definida, usa EJECUTAR para aplicarla.' })
      return
    }
    // No defined transition — correct to reject
    addScore(100)
    const rt = rejectTransition(config)
    const sym = readSymbol(config)
    const next = applyTransition(config, rt)
    setTrace((t) => [
      ...t,
      { text: `✓ δ(${config.state},${sym}) indefinida → rechazar a qR.`, tone: 'ok' },
    ])
    setConfig(next)
    resetSelects(next)
    if (next.done && next.result) {
      setLocked(true)
      markDone(selected, next.result)
    } else {
      setMsg({ tone: 'accent', text: '✓ Correcto. Continúa con el siguiente paso.' })
    }
  }

  function handleAccept() {
    if (locked || config.done) return
    const exp = lookup(config)
    if (exp === null || exp.next !== 'qA') {
      setMsg({
        tone: 'error',
        text: exp === null
          ? 'No hay transición definida aquí; la MT debe rechazar, no aceptar.'
          : `La transición lleva a ${exp.next}, no a qA. Usa EJECUTAR.`,
      })
      return
    }
    // Correct — auto-apply the accept transition
    addScore(100)
    const sym = readSymbol(config)
    const next = applyTransition(config, exp)
    setTrace((t) => [
      ...t,
      { text: `✓ δ(${config.state},${sym}) = (${exp.next},${exp.write},${exp.dir}) — ACEPTAR.`, tone: 'ok' },
    ])
    setConfig(next)
    resetSelects(next)
    if (next.done && next.result) {
      setLocked(true)
      markDone(selected, next.result)
    } else {
      setMsg({ tone: 'accent', text: '✓ Correcto. Continúa con el siguiente paso.' })
    }
  }

  const sym = readSymbol(config)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <RoomHeader
        title="SALA 2 · LA CINTA — MÁQUINA DE TURING"
        subtitle="L = { 0ⁿ1ⁿ | n ≥ 1 }   //   marca 0→X y 1→Y por pares; acepta cuando solo quedan marcas."
        lives={roomLives}
      />

      <div className="mb-4">
        <SystemMessage tone={msg.tone}>{msg.text}</SystemMessage>
      </div>

      <div className="mb-4">
        <TestStringPicker items={TM_TEST_STRINGS} selected={selected} done={done} onSelect={loadString} />
      </div>

      {/* Instantaneous description */}
      <Panel label="Descripción instantánea" className="mb-4">
        <div className="font-mono text-sm text-accent break-all">
          {instantaneousDescription(config)}
        </div>
        <div className="mt-1.5 font-mono text-xs text-faint">
          estado <span className="text-accent">{config.state}</span>
          <span className="mx-2">·</span>
          cabeza en <span className="text-accent">{sym}</span>
          <span className="mx-2">·</span>
          paso <span className="text-accent">{config.steps}</span>
        </div>
      </Panel>

      {/* Tape visualization */}
      <div className="mb-4">
        <div className="mb-1.5 text-[0.6rem] uppercase tracking-[0.15em] text-faint">Cinta</div>
        <Tape tape={config.tape} head={config.head} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        {/* Left: rules + controls */}
        <div className="space-y-3">
          <Panel label="Función de transición δ">
            <div className="space-y-1 font-mono text-xs leading-relaxed">
              {TM_RULE_ROWS.map((row, ri) => (
                <div key={ri} className="flex flex-wrap gap-x-5 gap-y-0.5">
                  {row.map((cell) => (
                    <span key={cell.lhs} className="text-muted">
                      <span className="text-accent">{cell.lhs}</span> = {cell.rhs}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Panel>

          {/* Controls */}
          <Panel label="Controles">
            <div className="flex flex-wrap items-end gap-4">
              {/* Write select */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-faint">Escribir</label>
                <select
                  value={selWrite}
                  onChange={(e) => setSelWrite(e.target.value as TmSymbol)}
                  disabled={locked || config.done}
                  className="rounded bg-ink-900 border border-ink-600 text-accent px-2 py-1 font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {TM_SYMBOLS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Direction select */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-faint">Mover</label>
                <select
                  value={selDir}
                  onChange={(e) => setSelDir(e.target.value as TmDir)}
                  disabled={locked || config.done}
                  className="rounded bg-ink-900 border border-ink-600 text-accent px-2 py-1 font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="L">← L</option>
                  <option value="R">→ R</option>
                </select>
              </div>

              {/* Next state select */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-faint">Estado</label>
                <select
                  value={selNext}
                  onChange={(e) => setSelNext(e.target.value as TmState)}
                  disabled={locked || config.done}
                  className="rounded bg-ink-900 border border-ink-600 text-accent px-2 py-1 font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {TM_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={executeStep} disabled={locked || config.done}>
                Ejecutar
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={locked || config.done}>
                Rechazar
              </Button>
              <Button variant="good" onClick={handleAccept} disabled={locked || config.done}>
                Aceptar
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right: trace / history */}
        <Panel label="Historial" className="max-h-96 overflow-y-auto">
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
      </div>
    </motion.div>
  )
}
