// ============================================================
// Room 1 — Pushdown Automaton engine
// L = { aⁿbⁿ | n ≥ 1 }
//
//   Q  = { q0, q1, q2 }      Σ = { a, b }     Γ = { a, Z₀ }
//   q0 initial, q2 accepting, Z₀ bottom marker.
//
//   δ(q0, a, Z₀) = (q0, aZ₀)   push a
//   δ(q0, a, a)  = (q0, aa)     push a
//   δ(q0, b, a)  = (q1, ε)      pop a, → q1
//   δ(q1, b, a)  = (q1, ε)      pop a
//   δ(q1, ε, Z₀) = (q2, Z₀)     accept (empty stack ∧ input consumed)
//   anything else → reject
// ============================================================

import type { PdaAction, PdaConfig, PdaTestString } from '../types'

export const BOTTOM = 'Z₀'

export const PDA_RULES: { lhs: string; rhs: string; note: string }[] = [
  { lhs: 'δ(q₀, a, Z₀)', rhs: '(q₀, aZ₀)', note: 'PUSH a' },
  { lhs: 'δ(q₀, a, a)', rhs: '(q₀, aa)', note: 'PUSH a' },
  { lhs: 'δ(q₀, b, a)', rhs: '(q₁, ε)', note: 'POP a · q₀→q₁' },
  { lhs: 'δ(q₁, b, a)', rhs: '(q₁, ε)', note: 'POP a' },
  { lhs: 'δ(q₁, ε, Z₀)', rhs: '(q₂, Z₀)', note: 'ACEPTAR' },
]

export const PDA_TEST_STRINGS: PdaTestString[] = [
  { value: 'aabb', expected: 'accept' },
  { value: 'aaabbb', expected: 'accept' },
  { value: 'aaab', expected: 'reject' },
  { value: 'b', expected: 'reject' },
]

export function initPda(input: string): PdaConfig {
  return { input, pos: 0, stack: [BOTTOM], state: 'q0', done: false, result: null }
}

/** Current input symbol, or 'ε' when input is fully consumed. */
export function currentSymbol(c: PdaConfig): string {
  return c.pos < c.input.length ? c.input[c.pos] : 'ε'
}

/** Top of stack, or null when empty (only ever the bottom marker remains here). */
export function stackTop(c: PdaConfig): string | null {
  return c.stack.length ? c.stack[c.stack.length - 1] : null
}

/** The single correct action for the current configuration. */
export function correctAction(c: PdaConfig): PdaAction {
  const sym = currentSymbol(c)
  const top = stackTop(c)
  if (c.state === 'q1' && sym === 'ε' && top === BOTTOM) return 'accept'
  if (c.state === 'q0' && sym === 'a' && (top === BOTTOM || top === 'a')) return 'push'
  if (c.state === 'q0' && sym === 'b' && top === 'a') return 'pop'
  if (c.state === 'q1' && sym === 'b' && top === 'a') return 'pop'
  return 'reject'
}

/** Human-readable transition tuple for a given action at the current config. */
export function transitionLabel(c: PdaConfig, action: PdaAction): string {
  const sym = currentSymbol(c)
  const top = stackTop(c)
  switch (action) {
    case 'accept':
      return 'δ(q₁, ε, Z₀) = (q₂, Z₀) — ACEPTAR'
    case 'push':
      return `δ(q₀, a, ${top}) = (q₀, a${top}) — PUSH a`
    case 'pop':
      return c.state === 'q0'
        ? 'δ(q₀, b, a) = (q₁, ε) — POP · q₀→q₁'
        : 'δ(q₁, b, a) = (q₁, ε) — POP'
    case 'reject':
      return `δ(${c.state}, ${sym}, ${top ?? '∅'}) — sin transición ⇒ RECHAZAR`
  }
}

/** Pedagogical explanation of why `action` is correct here. */
export function explanation(action: PdaAction): string {
  switch (action) {
    case 'accept':
      return 'La pila quedó vacía (solo Z₀), toda la entrada fue consumida y estamos en q₁. La transición δ(q₁, ε, Z₀)=(q₂, Z₀) lleva al estado final: cada a se emparejó con una b.'
    case 'push':
      return 'En q₀ leyendo a, apilamos a para recordar que hay una a pendiente de emparejar. Así contamos las as antes de ver las bs.'
    case 'pop':
      return 'Al leer b con a en el tope, desapilamos: esta b se empareja con una a previa. Desde q₀ la transición pasa a q₁ (ya no se admiten más as).'
    case 'reject':
      return 'No hay transición definida para esta configuración (símbolo, estado o tope inesperado), así que la cadena no pertenece a L y se rechaza.'
  }
}

export interface PdaApply {
  next: PdaConfig
  /** What visually happened to the stack this step, for animation. */
  stackEvent: 'push' | 'pop' | 'none'
}

/** Apply the (assumed-correct) action, returning the next configuration. */
export function applyAction(c: PdaConfig, action: PdaAction): PdaApply {
  const next: PdaConfig = { ...c, stack: [...c.stack] }
  switch (action) {
    case 'push':
      next.stack.push('a')
      next.pos++
      return { next, stackEvent: 'push' }
    case 'pop':
      next.stack.pop()
      next.state = 'q1'
      next.pos++
      return { next, stackEvent: 'pop' }
    case 'accept':
      next.state = 'q2'
      next.done = true
      next.result = 'accept'
      return { next, stackEvent: 'none' }
    case 'reject':
      next.done = true
      next.result = 'reject'
      return { next, stackEvent: 'none' }
  }
}
