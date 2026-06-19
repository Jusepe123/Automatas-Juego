import { Typewriter } from './Typewriter'
import { Lives } from './Lives'

interface Props {
  title: string
  subtitle: string
  /** Omit to hide the hearts row (e.g. the Oracle room has no lives). */
  lives?: number
}

/** Standard room header: typed title, formal-language subtitle, lives row. */
export function RoomHeader({ title, subtitle, lives }: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold tracking-[0.15em] text-accent sm:text-lg">
          <span className="mr-2 text-accent">▌</span>
          <Typewriter text={title} speed={18} />
        </h2>
        {lives !== undefined && <Lives current={lives} />}
      </div>
      <p className="mt-1.5 font-mono text-xs leading-relaxed text-faint">{subtitle}</p>
    </div>
  )
}
