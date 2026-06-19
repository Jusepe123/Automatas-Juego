import { useGame } from '../state/gameStore'
import type { RoomId } from '../types'

const TABS: { id: RoomId; label: string; sub: string; dot: string }[] = [
  { id: 0, label: 'Sala 1', sub: 'La Pila', dot: 'bg-pda' },
  { id: 1, label: 'Sala 2', sub: 'La Cinta', dot: 'bg-tm' },
  { id: 2, label: 'Sala 3', sub: 'El Oráculo', dot: 'bg-oracle' },
]

/** Top progress tabs showing which room is active / done / locked. */
export function RoomTabs() {
  const { room, completed, unlocked } = useGame()

  return (
    <div className="grid grid-cols-3 border-b border-ink-700">
      {TABS.map((t) => {
        const active = room === t.id && !completed[t.id]
        const done = completed[t.id]
        const locked = !unlocked[t.id]
        return (
          <div
            key={t.id}
            className={`flex items-center justify-center gap-2 border-b-2 px-3 py-3 text-center transition-all duration-300 ${
              active
                ? 'border-[rgb(var(--accent))] bg-ink-800/60'
                : done
                  ? 'border-ink-600 opacity-70'
                  : 'border-transparent'
            } ${locked ? 'opacity-30' : ''}`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${t.dot} ${
                active ? 'shadow-[0_0_8px_currentColor]' : ''
              } ${!active && !done ? 'opacity-40' : ''}`}
            />
            <span className="leading-tight">
              <span
                className={`block text-xs font-semibold uppercase tracking-wider ${
                  active ? 'text-slate-100' : 'text-muted'
                }`}
              >
                {t.label}
              </span>
              <span className="block text-[0.6rem] uppercase tracking-wide text-faint">
                {done ? '✓ completada' : locked ? '🔒 bloqueada' : t.sub}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
