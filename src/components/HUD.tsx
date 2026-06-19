import { useEffect, useState } from 'react'
import { useGame } from '../state/gameStore'

function formatClock(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Fixed top bar: score, room, high score, progress, timer. */
export function HUD() {
  const { score, room, highScore, completed, startTime } = useGame()
  const [clock, setClock] = useState('00:00')

  useEffect(() => {
    if (!startTime) return
    const id = setInterval(() => setClock(formatClock(Date.now() - startTime)), 250)
    return () => clearInterval(id)
  }, [startTime])

  const progress = (completed.filter(Boolean).length / 3) * 100

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink-700/80 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 text-xs">
        <Stat label="Puntaje" value={score.toLocaleString()} className="text-accent" />
        <Stat label="Sala" value={`${room + 1}/3`} />
        <Stat label="Récord" value={highScore.toLocaleString()} className="text-slate-300" />

        <div className="flex min-w-[120px] flex-1 items-center gap-3">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full rounded-full bg-[rgb(var(--accent))] transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="tabular-nums text-faint">{clock}</span>
      </div>
    </header>
  )
}

function Stat({
  label,
  value,
  className = 'text-slate-200',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.6rem] uppercase tracking-[0.15em] text-faint">{label}</span>
      <span className={`font-semibold tabular-nums ${className}`}>{value}</span>
    </div>
  )
}
