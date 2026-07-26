/**
 * Logica pura del comparador de 2 candidatos.
 *
 * Cruza las posturas de A vs las posturas de B por pregunta, y calcula
 * si coinciden (mismo valor Likert exacto) o no.
 *
 * No renderiza nada — solo transforma data. Facil de testear.
 */

import type { PosturaCandidatoDetalle } from "../api/endpoints";

/** Categoria de coincidencia entre 2 respuestas Likert (1..5). */
export type NivelCoincidencia = "identica" | "cercana" | "opuesta" | "solo_uno" | "ninguno";

export interface ItemComparacion {
  preguntaId: number;
  preguntaTexto: string;
  preguntaOrden: number;
  ejeTematico: string;
  ejeTematicoDisplay: string;

  posturaA: PosturaCandidatoDetalle | null;
  posturaB: PosturaCandidatoDetalle | null;

  /** True si ambos respondieron exactamente igual. */
  coinciden: boolean;
  nivel: NivelCoincidencia;
}

export interface GrupoComparacion {
  eje: string;
  ejeDisplay: string;
  items: ItemComparacion[];
}

export interface ResumenComparacion {
  total: number;
  identicas: number;
  cercanas: number;
  opuestas: number;
  soloUno: number;
  ninguno: number;
  /** Porcentaje de coincidencia (identica + cercana) sobre preguntas donde ambos respondieron. */
  porcentajeCoincidencia: number;
}

// ---------------------------------------------------------------------------

/**
 * Cruza dos listas de posturas por pregunta_id y devuelve items comparados
 * agrupados por eje tematico.
 *
 * - identica: mismo valor Likert
 * - cercana: diferencia de 1 punto
 * - opuesta: diferencia >= 3 puntos
 * - solo_uno: solo uno de los dos respondio
 * - ninguno: ninguno respondio (raro pero posible si se filtra por eje)
 */
export function compararPosturas(
  posturasA: PosturaCandidatoDetalle[],
  posturasB: PosturaCandidatoDetalle[]
): GrupoComparacion[] {
  const mapA = new Map<number, PosturaCandidatoDetalle>();
  const mapB = new Map<number, PosturaCandidatoDetalle>();
  for (const p of posturasA) mapA.set(p.pregunta, p);
  for (const p of posturasB) mapB.set(p.pregunta, p);

  // Union de todas las preguntas que aparecen en cualquiera de los dos.
  const todasLasPreguntas = new Map<
    number,
    { texto: string; orden: number; eje: string; ejeDisplay: string }
  >();
  for (const p of [...posturasA, ...posturasB]) {
    if (!todasLasPreguntas.has(p.pregunta)) {
      todasLasPreguntas.set(p.pregunta, {
        texto: p.pregunta_texto,
        orden: p.pregunta_orden,
        eje: p.eje_tematico,
        ejeDisplay: p.eje_tematico_display,
      });
    }
  }

  // Construyo items
  const items: ItemComparacion[] = [];
  for (const [preguntaId, meta] of todasLasPreguntas.entries()) {
    const a = mapA.get(preguntaId) ?? null;
    const b = mapB.get(preguntaId) ?? null;
    items.push({
      preguntaId,
      preguntaTexto: meta.texto,
      preguntaOrden: meta.orden,
      ejeTematico: meta.eje,
      ejeTematicoDisplay: meta.ejeDisplay,
      posturaA: a,
      posturaB: b,
      coinciden: !!(a && b && a.opcion_respuesta_valor === b.opcion_respuesta_valor),
      nivel: nivelDe(a, b),
    });
  }

  // Sort items por pregunta_orden
  items.sort((x, y) => x.preguntaOrden - y.preguntaOrden);

  // Agrupo por eje
  const grupos = new Map<string, GrupoComparacion>();
  for (const it of items) {
    if (!grupos.has(it.ejeTematico)) {
      grupos.set(it.ejeTematico, {
        eje: it.ejeTematico,
        ejeDisplay: it.ejeTematicoDisplay,
        items: [],
      });
    }
    grupos.get(it.ejeTematico)!.items.push(it);
  }
  return Array.from(grupos.values());
}

function nivelDe(
  a: PosturaCandidatoDetalle | null,
  b: PosturaCandidatoDetalle | null
): NivelCoincidencia {
  if (!a && !b) return "ninguno";
  if (!a || !b) return "solo_uno";
  const diff = Math.abs(a.opcion_respuesta_valor - b.opcion_respuesta_valor);
  if (diff === 0) return "identica";
  if (diff === 1) return "cercana";
  if (diff >= 3) return "opuesta";
  return "cercana"; // diff === 2 lo consideramos cercano (aunque tibio)
}

/** Suma los grupos y calcula el resumen global. */
export function calcularResumen(grupos: GrupoComparacion[]): ResumenComparacion {
  let identicas = 0;
  let cercanas = 0;
  let opuestas = 0;
  let soloUno = 0;
  let ninguno = 0;
  let total = 0;

  for (const g of grupos) {
    for (const it of g.items) {
      total++;
      if (it.nivel === "identica") identicas++;
      else if (it.nivel === "cercana") cercanas++;
      else if (it.nivel === "opuesta") opuestas++;
      else if (it.nivel === "solo_uno") soloUno++;
      else ninguno++;
    }
  }

  const ambosRespondieron = identicas + cercanas + opuestas;
  const porcentajeCoincidencia =
    ambosRespondieron > 0
      ? Math.round(((identicas + cercanas) / ambosRespondieron) * 100)
      : 0;

  return {
    total,
    identicas,
    cercanas,
    opuestas,
    soloUno,
    ninguno,
    porcentajeCoincidencia,
  };
}
