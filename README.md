# Turing's Escape

Juego educativo interactivo tipo *escape room* que pone a prueba tu comprensión de los **modelos formales de la computación**: Autómatas con Pila, Máquinas de Turing y Decidibilidad.

## Vista general

El jugador está "atrapado dentro de la Máquina Universal" y debe superar tres salas, cada una centrada en un modelo teórico distinto, para escapar.

---

## Salas

### Sala 1 — La Pila (Autómata con Pila / PDA)

**Lenguaje:** L = { aⁿ bⁿ | n ≥ 1 }

El jugador elige manualmente la acción correcta (PUSH, POP, ACEPTAR, RECHAZAR) en cada paso de la computación del autómata.

- Se visualiza la pila en tiempo real con animaciones de push/pop.
- Las transiciones δ se muestran como reglas.
- Se prueban 3 cadenas: `aabb` (aceptada), `aaab` (rechazada), `ab` (aceptada — caso borde).

### Sala 2 — La Cinta (Máquina de Turing / MT)

**Lenguaje:** L = { 0ⁿ 1ⁿ | n ≥ 1 }

El jugador selecciona el símbolo a escribir, la dirección del cabezal y el siguiente estado, luego ejecuta el paso. Debe acertar la transición definida por δ.

- La cinta se renderiza visualmente con el cabezal activo.
- Se muestran configuraciones instantáneas históricas.
- Se prueban las cadenas `01`, `0011` (aceptadas) y `001` (rechazada).

### Sala 3 — El Oráculo (Decidibilidad)

El jugador clasifica 5 problemas computacionales como **DECIDIBLE**, **RECONOCIBLE (no decidible)** o **INDECIDIBLE**.

- Cada respuesta muestra retroalimentación con una breve explicación conceptual.
- Problemas incluidos: Problema de la Parada, E_TM, ALL_TM, E_AFD, y pertenencia con MT decididora.

---

## Estilo visual

- Estética **retro-terminal refinada**: fondo carbón profundo, un acento por sala
  (verde-teal · cian · violeta) y resplandor sobrio en lugar de neón saturado.
- Tipografía monospace (**JetBrains Mono**) con jerarquía tipográfica real.
- Animaciones fluidas con **Framer Motion**: push/pop de la pila, deslizamiento del
  cabezal de la cinta, transiciones entre salas y entradas escalonadas.
- Fondo ambiental discreto (glow + rejilla sutil); sin «lluvia matrix» ruidosa.
- Diseño responsive y accesible (respeta `prefers-reduced-motion`).

---

## Lógica del juego

### Mecánica general

- El juego tiene **3 vidas por sala**; al fallar se pierde una y se reinicia la cadena actual.
- Las salas se desbloquean secuencialmente al completar la anterior.
- Una barra de progreso indica qué sala está activa, completada o bloqueada.
- Al superar las 3 salas se muestra una pantalla de victoria con resumen.

### Flujo de datos

```
startGame()
  → resetPDA('aabb')   // Sala 1 inicia con cadena por defecto
  → El jugador elige acciones (push/pop/accept/reject)
  → Al completar las 3 cadenas → advanceRoom()
    → resetTM('01')     // Sala 2
    → El jugador elige (write, dir, state) en cada paso
    → Al aceptar o rechazar → advanceRoom()
      → resetR3()       // Sala 3
      → 5 problemas de clasificación
      → Al terminar → pantalla de victoria
```

---

## Cómo ejecutar

Este proyecto pasó de ser un único `.html` a una aplicación **Vite + React + TypeScript**.

```bash
npm install      # instalar dependencias (una vez)
npm run dev      # servidor de desarrollo con recarga en caliente
npm run build    # build de producción (typecheck + bundle en dist/)
npm run preview  # servir el build de producción localmente
```

Requiere Node 18+ (probado con Node 22).

### Estructura

```
src/
  engines/    pda.ts · tm.ts · decidability.ts   ← lógica formal (sin UI)
  rooms/      PdaRoom · TmRoom · OracleRoom       ← una sala por componente
  components/ Stack · Tape · HUD · ...            ← UI reutilizable
  screens/    StartScreen · VictoryScreen
  state/      gameStore.ts                        ← vidas, puntaje, progresión
  App.tsx
```

La teoría (autómatas, tabla δ, clasificaciones) vive en `src/engines/` y es la fuente de
verdad del juego. Ver `SOLUCIONES.md` para trazas paso a paso y fundamentos.

> El archivo original `turings_escape_v2.html` se conserva como referencia histórica.
