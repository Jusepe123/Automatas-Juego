import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from './state/gameStore'
import { ROOM_ACCENT } from './types'
import { HUD } from './components/HUD'
import { RoomTabs } from './components/RoomTabs'
import { TransitionOverlay } from './components/TransitionOverlay'
import { StartScreen } from './screens/StartScreen'
import { VictoryScreen } from './screens/VictoryScreen'
import { PdaRoom } from './rooms/PdaRoom'
import { TmRoom } from './rooms/TmRoom'
import { OracleRoom } from './rooms/OracleRoom'

export default function App() {
  const screen = useGame((s) => s.screen)
  const room = useGame((s) => s.room)
  const transition = useGame((s) => s.transition)

  // Drive the ambient backdrop accent from the active (or incoming) room.
  useEffect(() => {
    const target =
      transition && transition.to !== 'victory' ? transition.to : screen === 'victory' ? 2 : room
    document.body.dataset.accent = ROOM_ACCENT[target]
  }, [room, screen, transition])

  return (
    <div data-accent={ROOM_ACCENT[room]}>
      <TransitionOverlay />

      <AnimatePresence mode="wait">
        {screen === 'start' && <StartScreen key="start" />}

        {screen === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HUD />
            <main className="mx-auto mt-16 w-[96%] max-w-5xl pb-16">
              <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40 backdrop-blur-sm">
                <RoomTabs />
                <div className="p-5 sm:p-6">
                  <AnimatePresence mode="wait">
                    <div key={room}>
                      {room === 0 && <PdaRoom />}
                      {room === 1 && <TmRoom />}
                      {room === 2 && <OracleRoom />}
                    </div>
                  </AnimatePresence>
                </div>
              </div>
            </main>
          </motion.div>
        )}

        {screen === 'victory' && <VictoryScreen key="victory" />}
      </AnimatePresence>
    </div>
  )
}
