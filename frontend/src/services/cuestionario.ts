/**
 * Logica pura del cuestionario (sin React, sin store, sin UI).
 *
 * - constantes de pesos
 * - helpers para separar opciones regulares vs "no sé"
 * - reglas para decidir cuando mostrar el selector de peso
 * - calculo de progreso
 *
 * Todo testeable con inputs/outputs planos.
 */
import type { OpcionRespuesta, Pregunta } from "../api/endpoints";

// -- Pesos --------------------------------------------------------------------

export type PesoValue = 0 | 1 | 2 | 3;

export interface PesoOption {
  value: PesoValue;
  label: string;
}

export const PESOS: readonly PesoOption[] = [
  { value: 0, label: "No me importa" },
  { value: 1, label: "Poco" },
  { value: 2, label: "Medio" },
  { value: 3, label: "Mucho" },
] as const;

export const DEFAULT_PESO: PesoValue = 2;

// -- Opciones -----------------------------------------------------------------

export interface OpcionesSeparadas {
  regulares: OpcionRespuesta[];
  noSe: OpcionRespuesta | undefined;
}

export function separarOpciones(
  opciones: OpcionRespuesta[] | undefined
): OpcionesSeparadas {
  const list = opciones ?? [];
  return {
    regulares: list.filter((o) => !o.es_no_se),
    noSe: list.find((o) => o.es_no_se),
  };
}

/**
 * Devuelve true si la opcion elegida NO es "No sé", es decir,
 * tiene sentido preguntar el peso al usuario.
 */
export function debeMostrarPeso(
  opciones: OpcionRespuesta[] | undefined,
  opcionElegidaId: number | undefined
): boolean {
  if (opcionElegidaId == null) return false;
  const elegida = (opciones ?? []).find((o) => o.id === opcionElegidaId);
  return elegida != null && !elegida.es_no_se;
}

// -- Progreso ----------------------------------------------------------------

/**
 * Progreso en 0..100 basado en el indice actual (0-based) y total.
 * Al arrancar la primera pregunta ya muestra algo, no 0.
 */
export function calcularProgreso(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return ((currentIndex + 1) / total) * 100;
}

// -- Navegacion --------------------------------------------------------------

export function esUltimaPregunta(currentIndex: number, total: number): boolean {
  return currentIndex >= total - 1;
}

export function esPrimeraPregunta(currentIndex: number): boolean {
  return currentIndex <= 0;
}

// -- Validacion --------------------------------------------------------------

export interface RespuestaMinima {
  opcionElegidaId: number;
  peso: PesoValue;
}

/**
 * Todas las preguntas deben tener respuesta antes de submit.
 * "No sé" cuenta como respuesta valida.
 */
export function puedeEnviar(
  preguntas: Pregunta[],
  respuestas: Record<number, RespuestaMinima | undefined>
): boolean {
  if (preguntas.length === 0) return false;
  return preguntas.every((p) => respuestas[p.id] != null);
}
