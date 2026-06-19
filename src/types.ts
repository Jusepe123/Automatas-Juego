// ============================================================
// Shared domain types for Turing's Escape
// ============================================================

export type RoomId = 0 | 1 | 2
export type Accent = 'pda' | 'tm' | 'oracle'

export const ROOM_ACCENT: Record<RoomId, Accent> = {
  0: 'pda',
  1: 'tm',
  2: 'oracle',
}

// ---------- Room 1: Pushdown Automaton (PDA) ----------
// L = { aⁿbⁿ | n ≥ 1 }

export type PdaAction = 'push' | 'pop' | 'accept' | 'reject'
export type PdaState = 'q0' | 'q1' | 'q2'

/** A single configuration of the PDA computation. */
export interface PdaConfig {
  input: string
  /** Index of the next unread input symbol (input[pos]). */
  pos: number
  /** Stack with the bottom marker 'Z₀' at index 0; top is the last element. */
  stack: string[]
  state: PdaState
  done: boolean
  result: 'accept' | 'reject' | null
}

export interface PdaTestString {
  value: string
  /** Ground-truth verdict for this string under the automaton. */
  expected: 'accept' | 'reject'
}

// ---------- Room 2: Turing Machine (TM) ----------
// L = { 0ⁿ1ⁿ | n ≥ 1 }

export type TmDir = 'L' | 'R'
export type TmState = 'q0' | 'q1' | 'q2' | 'q3' | 'qA' | 'qR'
export type TmSymbol = '0' | '1' | 'X' | 'Y' | 'B'

/** A transition δ(state, read) = (next, write, dir). */
export interface TmTransition {
  write: TmSymbol
  dir: TmDir
  next: TmState
}

/** A player's proposed transition for the current step. */
export interface TmMove {
  write: TmSymbol
  dir: TmDir
  next: TmState
}

export interface TmConfig {
  input: string
  tape: TmSymbol[]
  head: number
  state: TmState
  steps: number
  done: boolean
  result: 'accept' | 'reject' | null
}

export interface TmTestString {
  value: string
  expected: 'accept' | 'reject'
}

// ---------- Room 3: Decidability (The Oracle) ----------

export type Decidability = 'decidable' | 'recognizable' | 'undecidable'

export interface DecidabilityProblem {
  id: number
  /** Short symbolic name, e.g. "A_TM". */
  tag: string
  /** The question posed to the player. */
  text: string
  answer: Decidability
  /** Formal justification shown after answering. */
  explanation: string
  /** Optional nudge the player can spend to reveal. */
  hint: string
}
