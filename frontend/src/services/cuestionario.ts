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

/**
 * TASK-054: fuente unica de verdad para labels de pesos.
 * - label: etiqueta corta para chips de seleccion (espacio limitado en cuestionario).
 * - labelLargo: etiqueta completa para display en modal/listados donde hay mas espacio.
 */
export interface PesoOption {
  value: PesoValue;
  label: string;
  labelLargo: string;
}

export const PESOS: readonly PesoOption[] = [
  { value: 0, label: "No me importa",  labelLargo: "No me importa" },
  { value: 1, label: "Poco",           labelLargo: "Poco importante" },
  { value: 2, label: "Medio",          labelLargo: "Importante" },
  { value: 3, label: "Mucho",          labelLargo: "Muy importante" },
] as const;

/**
 * Lookup de labels de display (formato largo) indexado por valor.
 * Importar en lugar de definir Record<number, string> local en cada consumer.
 */
export const PESO_LABELS_DISPLAY: Readonly<Record<PesoValue, string>> = {
  0: "No me importa",
  1: "Poco importante",
  2: "Importante",
  3: "Muy importante",
} as const;

export const DEFAULT_PESO: PesoValue = 2;

/** Minimo de respuestas para habilitar la vista de resultados parciales.
 *  PRODUCT-001 (2026-08-02): subido de 5 a 10 — con menos de 10 el matching
 *  no es suficientemente confiable para mostrarlo como resultado parcial.
 *  Centralizado aqui como fuente unica de verdad; no usar magic numbers en UI.
 */
export const MIN_RESPUESTAS_PARA_RESULTADO = 10;

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

// -- Subtitle del header del cuestionario ------------------------------------

export type ParticionCuestionario = "base" | "extras";

/**
 * Formatea el subtitle "N de M · particion" del header del cuestionario.
 * Centralizado para evitar strings de dominio hardcodeados en la UI.
 * Cuando lleguen preguntas extras, la pantalla pasa particion="extras".
 */
export function formatSubtitleCuestionario(
  idx: number,
  total: number,
  particion: ParticionCuestionario = "base"
): string {
  return `${idx + 1} de ${total} \u00b7 ${particion}`;
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
