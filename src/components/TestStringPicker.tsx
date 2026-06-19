interface Item {
  value: string
  expected: 'accept' | 'reject'
}

interface Props {
  items: Item[]
  selected: string
  done: Set<string>
  onSelect: (value: string) => void
}

/** Chips for choosing which test string to run; marks solved ones. */
export function TestStringPicker({ items, selected, done, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const isDone = done.has(it.value)
        const isSel = selected === it.value
        return (
          <button
            key={it.value}
            onClick={() => onSelect(it.value)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
              isSel
                ? 'border-[rgb(var(--accent))] bg-accent/10 text-accent'
                : 'border-ink-600 text-muted hover:border-ink-500 hover:text-slate-200'
            } ${isDone ? 'opacity-45' : ''}`}
          >
            <span className={isDone ? 'line-through' : ''}>{it.value || 'ε'}</span>
            <span className="ml-1.5 text-[0.65rem] text-faint">
              {it.expected === 'accept' ? '✓' : '✗'}
            </span>
            {isDone && <span className="ml-1 text-good">●</span>}
          </button>
        )
      })}
    </div>
  )
}
