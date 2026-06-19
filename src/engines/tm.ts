// ============================================================
// Room 2 — Turing Machine engine
// L = { 0ⁿ1ⁿ | n ≥ 1 }
//
//   Q = { q0,q1,q2,q3,qA,qR }   Σ = {0,1}   Γ = {0,1,X,Y,B}
//   q0 initial, qA accept, qR reject, B blank.
//
//   δ(q0,0)=(q1,X,R)  mark a 0 as X, scan right
//   δ(q1,0)=(q1,0,R)  skip 0s
//   δ(q1,Y)=(q1,Y,R)  skip already-marked Ys
//   δ(q1,1)=(q2,Y,L)  mark a 1 as Y, scan left
//   δ(q2,0)=(q2,0,L)  walk back over 0s
//   δ(q2,Y)=(q2,Y,L)  walk back over Ys
//   δ(q2,X)=(q0,X,R)  found the X mark, start next pass
//   δ(q0,Y)=(q3,Y,R)  no 0s left, verify the Y tail
//   δ(q3,Y)=(q3,Y,R)  skip Ys
//   δ(q3,B)=(qA,B,R)  blank after Ys → ACCEPT
//   δ(q0,B)=(qR,B,R)  blank at start → REJECT (empty input)
//   undefined        → qR
// ============================================================

import type { TmConfig, TmState, TmSymbol, TmTransition } from '../types'

export const BLANK: TmSymbol = 'B'

export const TM_DELTA: Record<string, TmTransition> = {
  'q0,0': { write: 'X', dir: 'R', next: 'q1' },
  'q1,0': { write: '0', dir: 'R', next: 'q1' },
  'q1,Y': { write: 'Y', dir: 'R', next: 'q1' },
  'q1,1': { write: 'Y', dir: 'L', next: 'q2' },
  'q2,0': { write: '0', dir: 'L', next: 'q2' },
  'q2,Y': { write: 'Y', dir: 'L', next: 'q2' },
  'q2,X': { write: 'X', dir: 'R', next: 'q0' },
  'q0,Y': { write: 'Y', dir: 'R', next: 'q3' },
  'q3,Y': { write: 'Y', dir: 'R', next: 'q3' },
  'q3,B': { write: 'B', dir: 'R', next: 'qA' },
  'q0,B': { write: 'B', dir: 'R', next: 'qR' },
}

/** Compact rule list for display, grouped into rows. */
export const TM_RULE_ROWS: { lhs: string; rhs: string }[][] = [
  [
    { lhs: 'δ(q₀,0)', rhs: '(q₁,X,R)' },
    { lhs: 'δ(q₁,0)', rhs: '(q₁,0,R)' },
    { lhs: 'δ(q₁,Y)', rhs: '(q₁,Y,R)' },
  ],
  [
    { lhs: 'δ(q₁,1)', rhs: '(q₂,Y,L)' },
    { lhs: 'δ(q₂,0)', rhs: '(q₂,0,L)' },
    { lhs: 'δ(q₂,Y)', rhs: '(q₂,Y,L)' },
  ],
  [
    { lhs: 'δ(q₂,X)', rhs: '(q₀,X,R)' },
    { lhs: 'δ(q₀,Y)', rhs: '(q₃,Y,R)' },
    { lhs: 'δ(q₃,Y)', rhs: '(q₃,Y,R)' },
  ],
  [
    { lhs: 'δ(q₃,B)', rhs: '(qA,B,R)' },
    { lhs: 'δ(q₀,B)', rhs: '(qR,B,R)' },
    { lhs: 'indefinido', rhs: '→ qR' },
  ],
]

export const TM_TEST_STRINGS = [
  { value: '01', expected: 'accept' as const },
  { value: '001', expected: 'reject' as const },
]

export const TM_SYMBOLS: TmSymbol[] = ['0', '1', 'X', 'Y', 'B']
export const TM_STATES: TmState[] = ['q0', 'q1', 'q2', 'q3', 'qA', 'qR']

export function initTm(input: string): TmConfig {
  const tape: TmSymbol[] = ['B', ...(input.split('') as TmSymbol[]), 'B', 'B', 'B']
  return { input, tape, head: 1, state: 'q0', steps: 0, done: false, result: null }
}

export function readSymbol(c: TmConfig): TmSymbol {
  return c.tape[c.head] ?? BLANK
}

export function deltaKey(state: TmState, sym: TmSymbol): string {
  return `${state},${sym}`
}

/** The defined transition for the current config, or null (⇒ reject to qR). */
export function lookup(c: TmConfig): TmTransition | null {
  return TM_DELTA[deltaKey(c.state, readSymbol(c))] ?? null
}

/** Instantaneous description, e.g. "B X [q₁] 1 B B". */
export function instantaneousDescription(c: TmConfig): string {
  const left = c.tape.slice(0, c.head).join(' ')
  const right = c.tape.slice(c.head).join(' ')
  return `${left} [${c.state}] ${right}`.trim()
}

export interface TmApply {
  next: TmConfig
  /** True when the move equals the defined transition (or correct reject). */
  ok: boolean
}

/** Apply an (assumed-correct) transition and return the next config. */
export function applyTransition(c: TmConfig, t: TmTransition): TmConfig {
  const tape = [...c.tape]
  tape[c.head] = t.write
  let head = c.head + (t.dir === 'R' ? 1 : -1)
  // Grow the tape lazily so the head always has a blank to land on.
  if (head < 0) {
    tape.unshift(BLANK)
    head = 0
  }
  while (head >= tape.length) tape.push(BLANK)
  const done = t.next === 'qA' || t.next === 'qR'
  return {
    ...c,
    tape,
    head,
    state: t.next,
    steps: c.steps + 1,
    done,
    result: t.next === 'qA' ? 'accept' : t.next === 'qR' ? 'reject' : null,
  }
}

/** Reject transition used when no δ is defined (write current symbol, move R, → qR). */
export function rejectTransition(c: TmConfig): TmTransition {
  return { write: readSymbol(c), dir: 'R', next: 'qR' }
}
