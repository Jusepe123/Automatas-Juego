# Soluciones — Turing's Escape

---

## Sala 1: Autómata con Pila (PDA)

**Lenguaje:** L = { aⁿ bⁿ | n ≥ 1 }

### Función de transición δ

```
δ(q₀, a, Z₀) = (q₀, aZ₀)   — PUSH a, permanece en q₀
δ(q₀, a, a)  = (q₀, aa)    — PUSH a, permanece en q₀
δ(q₀, b, a)  = (q₁, ε)     — POP a, pasa a q₁
δ(q₁, b, a)  = (q₁, ε)     — POP a, permanece en q₁
δ(q₁, ε, Z₀) = (q₂, Z₀)    — ACEPTAR (estado final q₂)
```

Cualquier otra configuración no definida → RECHAZAR.

### Cadena: `aabb` → ACEPTAR

| Paso | Estado | Entrada restante | Símbolo | Tope | Acción | Transición |
|------|--------|-----------------|---------|------|--------|------------|
| 1 | q₀ | `aabb` | a | Z₀ | **PUSH** | δ(q₀, a, Z₀) = (q₀, aZ₀) |
| 2 | q₀ | `abb` | a | a | **PUSH** | δ(q₀, a, a) = (q₀, aa) |
| 3 | q₀ | `bb` | b | a | **POP** | δ(q₀, b, a) = (q₁, ε) |
| 4 | q₁ | `b` | b | a | **POP** | δ(q₁, b, a) = (q₁, ε) |
| 5 | q₁ | ▐FIN▐ | ε | Z₀ | **ACEPTAR** | δ(q₁, ε, Z₀) = (q₂, Z₀) |

Pila final: `[Z₀]` — vacía (solo marcador de fondo).

### Cadena: `aaabbb` → ACEPTAR

| Paso | Estado | Símbolo | Tope | Acción | Pila después |
|------|--------|---------|------|--------|-------------|
| 1 | q₀ | a | Z₀ | **PUSH** | [Z₀, a] |
| 2 | q₀ | a | a | **PUSH** | [Z₀, a, a] |
| 3 | q₀ | a | a | **PUSH** | [Z₀, a, a, a] |
| 4 | q₀ | b | a | **POP** | [Z₀, a, a] |
| 5 | q₁ | b | a | **POP** | [Z₀, a] |
| 6 | q₁ | b | a | **POP** | [Z₀] |
| 7 | q₁ | ε | Z₀ | **ACEPTAR** | [Z₀] |

### Cadena: `aaab` → RECHAZAR

| Paso | Estado | Símbolo | Tope | Acción | Pila después |
|------|--------|---------|------|--------|-------------|
| 1 | q₀ | a | Z₀ | **PUSH** | [Z₀, a] |
| 2 | q₀ | a | a | **PUSH** | [Z₀, a, a] |
| 3 | q₀ | a | a | **PUSH** | [Z₀, a, a, a] |
| 4 | q₀ | b | a | **POP** | [Z₀, a, a] |
| 5 | q₁ | ▐FIN▐ | a | **RECHAZAR** | — |

En el paso 5, la entrada se ha consumido (ε) pero el tope es `a`, no `Z₀`. No hay transición `δ(q₁, ε, a)` definida → la cadena debe ser RECHAZADA. Quedaron 2 `a` sin emparejar.

### Cadena: `b` → RECHAZAR

| Paso | Estado | Símbolo | Tope | Acción |
|------|--------|---------|------|--------|
| 1 | q₀ | b | Z₀ | **RECHAZAR** |

No hay transición `δ(q₀, b, Z₀)` definida. La cadena comienza con `b` y no hay `a` para emparejar.

---

## Sala 2: Máquina de Turing (MT) — Demo

**Lenguaje:** L = { 0ⁿ 1ⁿ | n ≥ 1 }

*Nota: Esta sala incluye solo 2 cadenas como demo. Completando ambas se desbloquea la Sala 3.*

**Controles:**
- **EJECUTAR** — aplica la transición seleccionada en los menús desplegables (escribir, mover, estado)
- **RECHAZAR** — cuando no hay transición definida, auto-configura qR y ejecuta el rechazo
- **ACEPTAR** — solo disponible cuando la transición correcta lleva a qA; la auto-configura y ejecuta

### Función de transición δ completa

```
δ(q₀, 0) = (q₁, X, R)   — marca el 0 como X, escanea a la derecha
δ(q₁, 0) = (q₁, 0, R)   — salta 0s restantes
δ(q₁, Y) = (q₁, Y, R)   — salta Ys ya marcados
δ(q₁, 1) = (q₂, Y, L)   — marca el 1 como Y, retrocede
δ(q₂, 0) = (q₂, 0, L)   — retrocede sobre 0s
δ(q₂, Y) = (q₂, Y, L)   — retrocede sobre Ys
δ(q₂, X) = (q₀, X, R)   — encuentra marca X, nueva iteración
δ(q₀, Y) = (q₃, Y, R)   — no quedan 0s, barre Ys
δ(q₃, Y) = (q₃, Y, R)   — continúa barriendo Ys
δ(q₃, B) = (qA, B, R)   — blanco al final → ACEPTAR
δ(q₀, B) = (qR, B, R)   — blanco al inicio → RECHAZAR
indefinido → qR           — cualquier otra → RECHAZAR
```

### Cadena: `01` → ACEPTAR

Configuración inicial: `B [q₀] 0 1 B B B`

| Paso | Estado | Símbolo | Escribir | Mover | Estado sig. | Cinta |
|------|--------|---------|----------|-------|-------------|-------|
| 1 | q₀ | 0 | X | R | q₁ | `B X [q₁] 1 B B B` |
| 2 | q₁ | 1 | Y | L | q₂ | `B [q₂] X Y B B B` |
| 3 | q₂ | X | X | R | q₀ | `B X [q₀] Y B B B` |
| 4 | q₀ | Y | Y | R | q₃ | `B X Y [q₃] B B B` |
| 5 | q₃ | B | B | R | qA | **ACEPTAR** |

### Cadena: `001` → RECHAZAR

Configuración inicial: `B [q₀] 0 0 1 B B B`

| Paso | Estado | Símbolo | Escribir | Mover | Estado sig. | Cinta |
|------|--------|---------|----------|-------|-------------|-------|
| 1 | q₀ | 0 | X | R | q₁ | `B X [q₁] 0 1 B B B` |
| 2 | q₁ | 0 | 0 | R | q₁ | `B X 0 [q₁] 1 B B B` |
| 3 | q₁ | 1 | Y | L | q₂ | `B X [q₂] 0 Y B B B` |
| 4 | q₂ | 0 | 0 | L | q₂ | `B [q₂] X 0 Y B B B` |
| 5 | q₂ | X | X | R | q₀ | `B X [q₀] 0 Y B B B` |
| 6 | q₀ | 0 | X | R | q₁ | `B X X [q₁] Y B B B` |
| 7 | q₁ | Y | Y | R | q₁ | `B X X Y [q₁] B B B` |
| 8 | q₁ | B | — | — | qR | **RECHAZAR** (δ(q₁,B) no definida) |

Tras el paso 7 se han consumido todos los 0s y 1s, pero la MT no ha podido emparejar el segundo 0 (no hay un segundo 1). La cadena `001` tiene 2 ceros y 1 uno → desbalanceada.

---

## Sala 3: El Oráculo — Decidibilidad

### Problema 1
**¿Acepta una Máquina de Turing M la cadena w? (A_TM)**
- **Respuesta:** RECONOCIBLE (no decidible)
- **Razonamiento:** A_TM es Turing-reconocible: podemos simular M con w y aceptar si M acepta. No es decidible porque el Problema de la Parada (¿para M sobre w?) se reduce a él. Si existiera un decididor para A_TM, podríamos decidir el Halting Problem.

### Problema 2
**¿Es vacío el lenguaje L(M) de una Máquina de Turing M? (E_TM)**
- **Respuesta:** IRRECONOCIBLE
- **Razonamiento:** Ni E_TM ni su complemento (NE_TM) son Turing-reconocibles. Se prueba reduciendo A_TM al complemento de E_TM: dada (M,w), construir M' que rechaza todo excepto w, y preguntar si L(M') es vacío. Por el Teorema de Rice, "ser vacío" es una propiedad no trivial del lenguaje, luego es indecidible.

### Problema 3
**¿Acepta una Máquina de Turing M todas las cadenas? (ALL_TM: L(M) = Σ*)**
- **Respuesta:** IRRECONOCIBLE
- **Razonamiento:** ALL_TM es un problema Π₂-completo en la jerarquía aritmética. No es reconocible ni co-reconocible. Se reduce desde el complemento del Problema de la Parada (co-A_TM). Si fuera reconocible, podríamos decidir problemas de nivel superior.

### Problema 4
**¿Es vacío el lenguaje de un Autómata Finito Determinista? (E_AFD)**
- **Respuesta:** DECIDIBLE
- **Razonamiento:** Como el AFD tiene un número finito de estados, podemos realizar un BFS o DFS desde el estado inicial para determinar si existe algún camino hacia un estado de aceptación. El algoritmo siempre termina en tiempo finito. Es un problema de grafo alcanzabilidad.

### Problema 5
**Dada una Máquina de Turing M que siempre para (un decididor), ¿pertenece la cadena w a L(M)?**
- **Respuesta:** DECIDIBLE
- **Razonamiento:** La premisa establece que M es un decididor (siempre para para toda entrada). Por tanto, podemos ejecutar M con w y, como M siempre para, obtendremos una respuesta de aceptación o rechazo en tiempo finito. Es un caso particular donde la pertenencia es decidible.

### Problema 6
**¿Tienen dos Máquinas de Turing M₁ y M₂ el mismo lenguaje? (EQ_TM)**
- **Respuesta:** IRRECONOCIBLE
- **Razonamiento:** EQ_TM no es reconocible ni co-reconocible. E_TM se reduce a EQ_TM: dada M, construir M' que rechaza todo; entonces L(M) = ∅ equivale a L(M) = L(M'). Por tanto, si EQ_TM fuera decidible, E_TM también lo sería. Por Rice, "tener el mismo lenguaje que M'" es una propiedad no trivial.

### Problema 7
**¿Es el lenguaje de una Máquina de Turing M no vacío? (NE_TM: L(M) ≠ ∅)**
- **Respuesta:** RECONOCIBLE (no decidible)
- **Razonamiento:** NE_TM es reconocible mediante la técnica de dovetailing: enumeramos todas las cadenas posibles en Σ* y simulamos M con cada una en paralelo (unas pocas instrucciones cada vez). Si M acepta alguna cadena, aceptamos. No es decidible porque su complemento E_TM no es reconocible (si NE_TM fuera decidible, E_TM también lo sería).
