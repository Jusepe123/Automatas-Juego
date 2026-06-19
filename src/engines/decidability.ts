// ============================================================
// Room 3 — The Oracle: decidability classification
// Each problem is classified as decidable / recognizable / undecidable.
// ============================================================

import type { Decidability, DecidabilityProblem } from '../types'

export const DECIDABILITY_LABELS: Record<Decidability, string> = {
  decidable: 'DECIDIBLE',
  recognizable: 'RECONOCIBLE (no decidible)',
  undecidable: 'IRRECONOCIBLE',
}

export const DECIDABILITY_BLURB: Record<Decidability, string> = {
  decidable: 'Existe una MT que siempre para y responde correctamente.',
  recognizable: 'Una MT acepta los «sí», pero puede no parar en los «no».',
  undecidable: 'Ni el problema ni su complemento son Turing-reconocibles.',
}

export const PROBLEMS: DecidabilityProblem[] = [
  {
    id: 1,
    tag: 'A_TM',
    text: '¿Acepta una Máquina de Turing M la cadena w? (Problema de Aceptación)',
    answer: 'recognizable',
    explanation:
      'A_TM es RECONOCIBLE: simulamos M sobre w y aceptamos si M acepta. No es decidible porque el Problema de la Parada se reduce a él. Es el ejemplo clásico de lenguaje Turing-reconocible que no es decidible.',
    hint: 'Piensa en la simulación directa. ¿Qué ocurre si M nunca para sobre w? ¿Puede un algoritmo decidir eso?',
  },
  {
    id: 2,
    tag: 'E_TM',
    text: '¿Es vacío el lenguaje L(M) de una Máquina de Turing M?',
    answer: 'undecidable',
    explanation:
      'E_TM es IRRECONOCIBLE: ni él ni su complemento son reconocibles. Se prueba reduciendo A_TM a ¬E_TM. Por el Teorema de Rice, toda propiedad no trivial del lenguaje de una MT es indecidible, y «ser vacío» es no trivial.',
    hint: 'Por el Teorema de Rice, toda propiedad no trivial del lenguaje de una MT es indecidible. ¿Es «ser vacío» una propiedad del lenguaje?',
  },
  {
    id: 3,
    tag: 'ALL_TM',
    text: '¿Acepta una Máquina de Turing M todas las cadenas? (L(M) = Σ*)',
    answer: 'undecidable',
    explanation:
      'ALL_TM es IRRECONOCIBLE. Determinar si L(M)=Σ* es Π₂-completo en la jerarquía aritmética: no es reconocible ni co-reconocible. Se reduce desde el complemento del Problema de la Parada.',
    hint: 'Este problema está aún más arriba en la jerarquía que A_TM: no es reconocible ni su complemento lo es.',
  },
  {
    id: 4,
    tag: 'E_AFD',
    text: '¿Es vacío el lenguaje de un Autómata Finito Determinista (AFD)?',
    answer: 'decidable',
    explanation:
      'E_AFD es DECIDIBLE: basta un BFS/DFS desde el estado inicial para ver si se alcanza algún estado de aceptación. Como el AFD tiene un número finito de estados, el algoritmo siempre termina. Es alcanzabilidad en un grafo.',
    hint: 'Los AFD tienen un número finito de estados. ¿Podemos buscar un camino del inicio a un estado de aceptación?',
  },
  {
    id: 5,
    tag: 'w ∈ L(decididor)',
    text: 'Dada una MT M que siempre para (un decididor), ¿pertenece w a L(M)?',
    answer: 'decidable',
    explanation:
      'DECIDIBLE. La premisa dice que M es un decididor: para toda entrada. Ejecutamos M sobre w y, como siempre para, obtenemos aceptación o rechazo en tiempo finito.',
    hint: 'La premisa garantiza que M siempre para. ¿Qué implica eso sobre poder responder la pregunta?',
  },
  {
    id: 6,
    tag: 'EQ_TM',
    text: '¿Tienen dos Máquinas de Turing M₁ y M₂ el mismo lenguaje?',
    answer: 'undecidable',
    explanation:
      'EQ_TM es IRRECONOCIBLE: ni él ni su complemento son reconocibles. E_TM se reduce a EQ_TM comparando M con una MT que rechaza todo. Si pudiéramos decidir EQ_TM, decidiríamos E_TM.',
    hint: 'Puedes reducir E_TM a este problema. Si pudieras decidir EQ_TM, ¿podrías decidir E_TM?',
  },
  {
    id: 7,
    tag: 'NE_TM',
    text: '¿Es no vacío el lenguaje de una Máquina de Turing M? (L(M) ≠ ∅)',
    answer: 'recognizable',
    explanation:
      'NE_TM es RECONOCIBLE (no decidible): por dovetailing enumeramos todas las cadenas y simulamos M en paralelo; si M acepta alguna, aceptamos. No es decidible porque su complemento E_TM no es reconocible.',
    hint: '¿Podemos buscar sistemáticamente, en paralelo, una cadena que M acepte? ¿Y si nunca acepta ninguna?',
  },
]
