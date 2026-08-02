/**
 * Dominio de Elecciones: tipos y helpers puros sobre el estado del cuestionario
 * de una eleccion y su cuenta regresiva.
 *
 * Reglas de negocio (no de UI) que la HomeScreen y sus componentes consumen:
 *  - Cuando un cuestionario esta "sin_empezar" vs "en_curso" vs "completa".
 *  - Como se etiqueta el progreso en lenguaje humano ("6 de 12 preguntas").
 *  - Cuantos dias faltan hasta la fecha de la eleccion.
 *
 * Sin dependencias de React ni de la API — 100% funciones puras testeables.
 */

// -- Estado del cuestionario -------------------------------------------------

export type EleccionEstado = "sin_empezar" | "en_curso" | "completa";

export interface EleccionProgreso {
  respondidas: number;
  total: number;
}

/**
 * Deriva el estado del cuestionario a partir del progreso.
 *
 *  - `completa` si el user respondio todas (>= total) — el >= es defensivo
 *    para tolerar drift entre backend y frontend (ej. una pregunta borrada).
 *  - `en_curso` si respondio al menos 1 pero no todas.
 *  - `sin_empezar` si no respondio nada, o si el total es 0 (sin preguntas
 *    definidas todavia).
 *
 * NOTA: hoy el backend solo persiste respuestas al final del cuestionario
 * (batch), asi que "en_curso" no ocurre en la practica. Se mantiene el estado
 * porque el diseno del wireframe lo contempla y para no bloquear la migracion
 * a submit incremental si el equipo la decide.
 */
export function deriveEleccionEstado({
  respondidas,
  total,
}: EleccionProgreso): EleccionEstado {
  if (total <= 0 || respondidas <= 0) return "sin_empezar";
  if (respondidas >= total) return "completa";
  return "en_curso";
}

/**
 * Etiqueta legible del progreso. Ej: "6 de 12 preguntas", "0 de 12 preguntas".
 *
 * Con total=0 devolvemos "Sin preguntas disponibles" para no mostrar "0 de 0"
 * que es ruido.
 */
export function formatProgresoLabel(
  respondidas: number,
  total: number,
): string {
  if (total <= 0) return "Sin preguntas disponibles";
  // Clamp defensivo: si el backend reporta respondidas > total (por drift),
  // mostrar total/total para no confundir al user con "13 de 12".
  const shown = Math.min(Math.max(respondidas, 0), total);
  return `${shown} de ${total} preguntas`;
}

/**
 * Fraccion de progreso [0, 1] para pintar barras. Nunca devuelve NaN ni >1.
 */
export function computeProgresoRatio(
  respondidas: number,
  total: number,
): number {
  if (total <= 0) return 0;
  const ratio = respondidas / total;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

// -- Cuenta regresiva --------------------------------------------------------

/**
 * Dias hasta la fecha de eleccion (redondeado hacia arriba). Devuelve null si
 * no hay fecha, o negativo si la eleccion ya paso (el consumer decide como
 * renderizarlo, ej. "Cerrada").
 *
 * @param fechaIso — fecha en formato ISO "YYYY-MM-DD" o null/undefined.
 * @param now — inyectable para testear sin mockear Date.now().
 */
export function computeDiasRestantes(
  fechaIso: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!fechaIso) return null;
  const target = new Date(fechaIso);
  if (Number.isNaN(target.getTime())) return null;
  const msPorDia = 1000 * 60 * 60 * 24;
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / msPorDia);
}

/**
 * Etiqueta corta del chip de dias. Ej: "42d", "180d", "hoy", "cerrada".
 * Devuelve null si no hay fecha (el consumer decide no mostrar chip).
 */
export function formatDiasRestantesChip(
  fechaIso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const dias = computeDiasRestantes(fechaIso, now);
  if (dias === null) return null;
  if (dias < 0) return "cerrada";
  if (dias === 0) return "hoy";
  return `${dias}d`;
}

// -- Filtro territorial -----------------------------------------------------

/**
 * Determina si un tipo de eleccion requiere filtro territorial (commune/distrito).
 *
 * Las elecciones de alcance nacional — Presidencial y Plebiscito — presentan
 * los mismos candidatos a todos los votantes del pais: el filtro de comuna es
 * irrelevante y la banner "setea tu comuna" seria confusa.
 *
 * Heuristica basada en el campo `nombre` porque el schema de TipoEleccion no
 * incluye un campo de scope explicito. Si el backend agrega uno (ej. `alcance`),
 * reemplazar este helper sin tocar las screens.
 *
 * NOTA: conservadora por defecto — devuelve `true` si no hay coincidencia,
 * ya que el filtro territorial es la norma, no la excepcion.
 */
const NOMBRES_NACIONALES_RE = /presidencial|plebiscito/i;

export function requiereFiltroTerritorial(
  nombreTipo: string | null | undefined,
): boolean {
  if (!nombreTipo) return true;
  return !NOMBRES_NACIONALES_RE.test(nombreTipo);
}
