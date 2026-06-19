// ============================================================
// Global game state (zustand)
// Screens, room progression, lives, score, timer, high score.
// ============================================================

import { create } from 'zustand'
import type { RoomId } from '../types'

export type Screen = 'start' | 'playing' | 'victory'

const LIVES_PER_ROOM = 5
const HIGH_SCORE_KEY = 'turingEscapeHigh'
const SPEED_BONUS = 200
const SPEED_WINDOW_MS = 30_000

function loadHigh(): number {
  const v = parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? '0', 10)
  return Number.isFinite(v) ? v : 0
}

export interface GameState {
  screen: Screen
  room: RoomId
  unlocked: [boolean, boolean, boolean]
  completed: [boolean, boolean, boolean]
  lives: [number, number, number]
  score: number
  totalErrors: number
  hintsUsed: number
  startTime: number | null
  attemptStart: number | null
  highScore: number
  newHigh: boolean

  /** Transition overlay between rooms / to victory. */
  transition: { active: boolean; to: RoomId | 'victory' } | null

  // --- actions ---
  startGame: () => void
  resetGame: () => void
  addScore: (pts: number) => void
  loseLife: (room: RoomId) => number
  refillLives: (room: RoomId) => void
  recordError: () => void
  useHint: () => void
  startAttemptTimer: () => void
  claimSpeedBonus: () => number
  completeRoom: (room: RoomId) => void
  finishTransition: () => void
}

export const useGame = create<GameState>((set, get) => ({
  screen: 'start',
  room: 0,
  unlocked: [true, false, false],
  completed: [false, false, false],
  lives: [LIVES_PER_ROOM, LIVES_PER_ROOM, LIVES_PER_ROOM],
  score: 0,
  totalErrors: 0,
  hintsUsed: 0,
  startTime: null,
  attemptStart: null,
  highScore: loadHigh(),
  newHigh: false,
  transition: null,

  startGame: () =>
    set({
      screen: 'playing',
      room: 0,
      unlocked: [true, false, false],
      completed: [false, false, false],
      lives: [LIVES_PER_ROOM, LIVES_PER_ROOM, LIVES_PER_ROOM],
      score: 0,
      totalErrors: 0,
      hintsUsed: 0,
      startTime: Date.now(),
      attemptStart: Date.now(),
      newHigh: false,
      transition: { active: true, to: 0 },
    }),

  resetGame: () =>
    set({
      screen: 'start',
      room: 0,
      unlocked: [true, false, false],
      completed: [false, false, false],
      lives: [LIVES_PER_ROOM, LIVES_PER_ROOM, LIVES_PER_ROOM],
      score: 0,
      totalErrors: 0,
      hintsUsed: 0,
      startTime: null,
      attemptStart: null,
      newHigh: false,
      transition: null,
    }),

  addScore: (pts) => set((s) => ({ score: Math.max(0, s.score + pts) })),

  loseLife: (room) => {
    const lives = [...get().lives] as [number, number, number]
    lives[room] = Math.max(0, lives[room] - 1)
    set({ lives })
    return lives[room]
  },

  refillLives: (room) => {
    const lives = [...get().lives] as [number, number, number]
    lives[room] = LIVES_PER_ROOM
    set({ lives })
  },

  recordError: () => set((s) => ({ totalErrors: s.totalErrors + 1 })),

  useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),

  startAttemptTimer: () => set({ attemptStart: Date.now() }),

  claimSpeedBonus: () => {
    const { attemptStart } = get()
    if (attemptStart && Date.now() - attemptStart <= SPEED_WINDOW_MS) {
      set((s) => ({ score: s.score + SPEED_BONUS }))
      return SPEED_BONUS
    }
    return 0
  },

  completeRoom: (room) => {
    const completed = [...get().completed] as [boolean, boolean, boolean]
    completed[room] = true
    const unlocked = [...get().unlocked] as [boolean, boolean, boolean]
    const nextRoom = (room + 1) as RoomId
    if (room < 2) unlocked[nextRoom] = true
    set({
      completed,
      unlocked,
      transition: { active: true, to: room < 2 ? nextRoom : 'victory' },
    })
  },

  finishTransition: () => {
    const t = get().transition
    if (!t) return
    if (t.to === 'victory') {
      const { score, highScore } = get()
      const newHigh = score > highScore
      if (newHigh) localStorage.setItem(HIGH_SCORE_KEY, String(score))
      set({
        screen: 'victory',
        transition: null,
        newHigh,
        highScore: newHigh ? score : highScore,
      })
    } else {
      set({ room: t.to, transition: null, attemptStart: Date.now() })
    }
  },
}))
