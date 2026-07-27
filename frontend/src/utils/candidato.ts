/**
 * Helpers puros para trabajar con Candidato.
 *
 * Funciones puras (sin side effects, sin hooks) — se pueden importar desde
 * cualquier screen o componente sin acoplar a React ni al store.
 *
 * Las funciones `nombreCompleto` e `iniciales` aceptan un shape LAXO
 * (`CandidatoLike`) para que sean utiles tanto con el modelo completo
 * `Candidato` como con subsets que traen los bookmarks (donde nombre y
 * apellido vienen como opcionales) o cuando el candidato aun no cargo
 * (null/undefined).
 */

import type { Candidato } from "../api/endpoints";

/** Shape minimo que basta para renderear nombre/iniciales de un candidato. */
export interface CandidatoLike {
  nombre?: string | null;
  apellido?: string | null;
}

/**
 * Concatena nombre + apellido. Tolera null/undefined y campos faltantes.
 *
 * Ejemplos:
 *   - `{ nombre: "Ana", apellido: "Perez" }` -> `"Ana Perez"`
 *   - `{ nombre: "Ana" }`                    -> `"Ana"`
 *   - `null` / `{}`                          -> `""`
 */
export function nombreCompleto(c: CandidatoLike | null | undefined): string {
  if (!c) return "";
  const n = c.nombre ?? "";
  const a = c.apellido ?? "";
  return `${n}${a ? ` ${a}` : ""}`.trim();
}

/**
 * Iniciales de 1-2 caracteres para avatares.
 *
 * Ejemplos:
 *   - `{ nombre: "Juan", apellido: "Perez" }` -> `"JP"`
 *   - `{ nombre: "Ana" }`                     -> `"A"`
 *   - `null` / `{}`                           -> `"?"`
 */
export function iniciales(c: CandidatoLike | null | undefined): string {
  if (!c) return "?";
  const first = c.nombre?.[0] ?? "";
  const last = c.apellido?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Sublabel opcional para cards de candidato: junta los tipos de eleccion
 * y el alcance territorial (si no es nacional) con " \u00b7 " como separador.
 *
 * Ej:
 *   - ["Presidencial"] + "nacional"   -> "Presidencial"
 *   - ["Alcaldia"]     + "Providencia" -> "Alcaldia \u00b7 Providencia"
 *   - []               + cualquiera    -> undefined
 */
export function sublabelCandidato(c: Candidato): string | undefined {
  const tipos = c.tipos_eleccion_nombres ?? [];
  if (tipos.length === 0) return undefined;
  if (c.alcance_territorial && c.alcance_territorial !== "nacional") {
    return `${tipos.join(" \u00b7 ")} \u00b7 ${c.alcance_territorial}`;
  }
  return tipos.join(" \u00b7 ");
}
