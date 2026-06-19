import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  /** ms per character. */
  speed?: number
  /** delay before typing starts. */
  startDelay?: number
  className?: string
  /** show a blinking caret while/after typing. */
  caret?: boolean
  onDone?: () => void
}

/** Types `text` out character by character with an optional caret. */
export function Typewriter({
  text,
  speed = 22,
  startDelay = 0,
  className = '',
  caret = true,
  onDone,
}: Props) {
  const [shown, setShown] = useState('')
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    setShown('')
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      i++
      setShown(text.slice(0, i))
      if (i < text.length) {
        timer = setTimeout(tick, speed)
      } else {
        doneRef.current?.()
      }
    }
    const start = setTimeout(tick, startDelay)
    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [text, speed, startDelay])

  const typing = shown.length < text.length
  return (
    <span className={className}>
      {shown}
      {caret && (
        <span
          className={`ml-0.5 inline-block w-[0.6ch] ${typing ? '' : 'animate-caret-blink'}`}
          style={{ color: 'rgb(var(--accent))' }}
        >
          ▌
        </span>
      )}
    </span>
  )
}
