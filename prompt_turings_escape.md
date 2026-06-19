# Prompt maestro — "Turing's Escape"
> Juego educativo digital · Autómatas y Calculabilidad  
> Para usar en **OpenCode** con el modelo **DeepSeek V3 (free)**

---

## Contexto para el modelo

Eres un experto en desarrollo web y en teoría de autómatas y calculabilidad. Vamos a construir un juego educativo digital completo llamado **"Turing's Escape"** en un **solo archivo HTML autocontenido** (sin dependencias externas, sin frameworks, solo HTML + CSS + JavaScript vanilla).

---

## Concepto narrativo del juego

El jugador está **"atrapado dentro de una máquina computacional"** y debe resolver puzzles formales para escapar. La pantalla de inicio muestra una historia narrativa:

> *"Estás atrapado dentro de la Máquina Universal. Para escapar debes demostrar que comprendes cómo funciono. Tienes tres salas que superar. En cada una deberás aplicar las reglas formales que me definen. Un solo error y la máquina te rechaza."*

Hay **3 salas / niveles progresivos**.

---

## Sala 1 — "La Pila" (nivel básico · Autómata con Pila)

**Lenguaje:** L = { aⁿ bⁿ | n ≥ 1 }

**Mecánica:**
- El jugador ve una cadena de entrada (ej: `aabbb`) y una **pila visual vacía**.
- Se muestran las **reglas de transición del AP** en pantalla.
- El jugador debe elegir la acción correcta en cada paso mediante botones:
  - `PUSH 'a'` al leer una 'a'
  - `POP` al leer una 'b' (verificando que el tope sea 'a')
  - `ACEPTAR` cuando la pila quede vacía y la entrada se haya consumido
  - `RECHAZAR` cuando detecte un error (pila vacía antes de tiempo, símbolo incorrecto, etc.)
- Mostrar la **traza paso a paso** en tiempo real: estado actual, símbolo leído, tope de pila, acción realizada.
- **3 cadenas a resolver:** una aceptada (`aabb`), una rechazada (`aaab`), una trampa (`ab` — válida pero corta).
- **Condición de aceptación:** pila vacía Y entrada completamente consumida.
- **Símbolo inicial de pila:** Z₀ (debe aparecer siempre al fondo de la pila).

**Autómata con pila formal (para que el código sea correcto):**

```
Estados: Q = {q0, q1, q2}
Alfabeto de entrada: Σ = {a, b}
Alfabeto de pila: Γ = {a, Z0}
Estado inicial: q0
Símbolo inicial de pila: Z0
Estado de aceptación: q2

Función de transición δ:
  δ(q0, a, Z0) = (q0, aZ0)     → push 'a', quedar en q0
  δ(q0, a, a)  = (q0, aa)      → push 'a', quedar en q0
  δ(q0, b, a)  = (q1, ε)       → pop 'a', pasar a q1
  δ(q1, b, a)  = (q1, ε)       → pop 'a', quedar en q1
  δ(q1, ε, Z0) = (q2, Z0)      → aceptar por estado final con Z0 en pila
```

---

## Sala 2 — "La Cinta" (nivel intermedio · Máquina de Turing)

**Lenguaje:** L = { 0ⁿ 1ⁿ | n ≥ 1 }

**Mecánica:**
- El jugador ve una **cinta visual con celdas individuales** (símbolos escritos), una **cabeza lectora marcada** con un cursor animado, el **estado actual** y la **tabla de transiciones completa** de la MT.
- En cada paso el jugador debe elegir mediante desplegables o botones:
  1. Qué símbolo **escribir** en la celda actual
  2. Hacia dónde **mover la cabeza**: `← (L)` o `→ (R)`
  3. A qué **estado transitar**
- Si elige mal → mensaje rojo con la regla violada y la transición correcta según la función δ.
- Mostrar la **configuración instantánea** en cada paso con el formato:

  ```
  q1 | 0 0 1 1   (cabeza sobre el primer 0)
  q2 | X 0 1 1   (cabeza sobre el segundo 0)
  ```

**Máquina de Turing formal:**

```
Estados: Q = {q0, q1, q2, q3, q4, qA, qR}
Alfabeto de entrada: Σ = {0, 1}
Alfabeto de cinta: Γ = {0, 1, X, Y, B}  (B = símbolo blanco)
Estado inicial: q0
Estado de aceptación: qA
Estado de rechazo: qR

Función de transición δ:
  δ(q0, 0) = (q1, X, R)   → marcar 0 como X, mover derecha
  δ(q1, 0) = (q1, 0, R)   → avanzar sobre 0s
  δ(q1, Y) = (q1, Y, R)   → avanzar sobre Ys ya marcadas
  δ(q1, 1) = (q2, Y, L)   → marcar 1 como Y, mover izquierda
  δ(q2, 0) = (q2, 0, L)   → retroceder sobre 0s
  δ(q2, Y) = (q2, Y, L)   → retroceder sobre Ys
  δ(q2, X) = (q0, X, R)   → volver al inicio del ciclo
  δ(q0, Y) = (q3, Y, R)   → todos los 0s marcados, verificar 1s
  δ(q3, Y) = (q3, Y, R)   → avanzar sobre Ys
  δ(q3, B) = (qA, B, R)   → ACEPTAR: cinta solo tiene X e Y
  δ(q0, B) = (qR, B, R)   → RECHAZAR: entrada vacía
  (cualquier transición no definida) → qR
```

---

## Sala 3 — "El Oráculo" (nivel avanzado · Decidibilidad)

**Mecánica:**
- Se presentan **5 problemas computacionales** uno por uno.
- El jugador debe clasificar cada problema en una de tres categorías (botones):
  - `DECIDIBLE` — existe una MT que siempre para y decide correctamente
  - `RECONOCIBLE (no decidible)` — existe una MT que acepta si la respuesta es sí, pero puede no parar si es no
  - `INDECIDIBLE` — ninguna MT puede resolver el problema en general
- Cada respuesta muestra **retroalimentación formal con justificación** (correcta o incorrecta).

**Los 5 problemas:**

| # | Problema | Respuesta correcta |
|---|----------|-------------------|
| 1 | ¿Acepta una MT M la cadena w? (Problema de la Parada) | Indecidible |
| 2 | ¿Es el lenguaje L(M) de una MT M igual al vacío? | Indecidible |
| 3 | ¿Acepta una MT M todas las cadenas? (L(M) = Σ*) | Indecidible |
| 4 | ¿Es el lenguaje de un AFD vacío? | Decidible |
| 5 | ¿Pertenece la cadena w al lenguaje L(M) de una MT M, dado que M para en todos los casos? | Decidible |

**Para cada respuesta incorrecta**, mostrar:
- Por qué la clasificación es incorrecta
- Una reducción informal o argumento de diagonal (para el Problema de la Parada)
- La diferencia entre lenguaje decidible y recursivamente enumerable

---

## Mecánicas generales del juego

### Sistema de progresión
- **3 vidas por sala.** Al agotar vidas se puede reintentar la sala desde el principio.
- Al completar una sala se desbloquea la siguiente con animación de transición.
- **Pantalla final de victoria** con resumen de todos los conceptos formales que el jugador aplicó.

### Retroalimentación
- Respuesta correcta → mensaje en verde con la explicación formal del paso.
- Respuesta incorrecta → mensaje en rojo con la regla violada, el paso correcto y referencia al concepto.
- Nunca mostrar solo "correcto" o "incorrecto" sin justificación formal.

### Diseño visual
- **Estética "terminal retro"** solo para el interior del juego: fondo negro (`#0a0a0a`), texto verde neón (`#00ff41`), tipografía monoespaciada (`monospace`), borde estilo consola.
- **Pantalla de inicio y menú:** más limpio, con tipografía sans-serif y colores neutros.
- **Pila visual (Sala 1):** representada como una columna vertical de bloques apilados, animación CSS al hacer push/pop.
- **Cinta visual (Sala 2):** fila horizontal de celdas con la cabeza lectora como un triángulo o cursor parpadeante, animación al moverse.
- **Sala 3:** tarjetas de problemas con tres botones de clasificación.

### Pantalla de inicio (obligatoria)
```
╔══════════════════════════════════════╗
║         T U R I N G ' S             ║
║           E S C A P E               ║
╠══════════════════════════════════════╣
║  Estás atrapado dentro de la         ║
║  Máquina Universal.                  ║
║                                      ║
║  Para escapar, debes demostrar       ║
║  que comprendes cómo funciono.       ║
║                                      ║
║  3 salas. 3 modelos. Sin errores.    ║
╠══════════════════════════════════════╣
║         [ INICIAR ESCAPE ]           ║
╚══════════════════════════════════════╝
```

---

## Requisitos técnicos obligatorios

- **Un solo archivo `.html`** — todo incrustado, sin archivos externos
- `<style>` incrustado en el `<head>`
- `<script>` incrustado al final del `<body>`
- Sin librerías externas (ni jQuery, ni Bootstrap, ni nada)
- Funcional al abrir el `.html` directamente en cualquier navegador moderno (Chrome, Firefox, Edge)
- Responsive para pantallas de 768px en adelante
- **Comentarios en el código** explicando cada sección importante con el formato:
  ```javascript
  // === SALA 1: Autómata con Pila ===
  // La función de transición δ se implementa aquí como un objeto de lookup.
  // Cada clave es "estado,símbolo_entrada,tope_pila" y el valor es [nuevo_estado, acción_pila]
  ```
- Los tres niveles deben estar **completamente implementados y funcionales**, no como placeholder.

---

## Verificación formal que debe pasar el código

Antes de entregar el archivo, verifica internamente que:

1. **Sala 1:** La cadena `aabb` es aceptada. La cadena `aaab` es rechazada. La cadena `ba` es rechazada inmediatamente. El símbolo Z₀ siempre está en el fondo de la pila.
2. **Sala 2:** La cadena `01` es aceptada en exactamente 4 pasos. La cadena `001` es rechazada. El símbolo blanco B se maneja en los bordes de la cinta.
3. **Sala 3:** El Problema de la Parada está clasificado como indecidible con argumento de diagonal. El problema del AFD vacío está clasificado como decidible.

Si alguna verificación falla, corrígela antes de generar la salida final.

---

## Entrega esperada

Un único bloque de código con el archivo `turings_escape.html` completo, funcional, comentado y formalmente correcto.
