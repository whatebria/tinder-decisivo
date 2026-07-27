/**
 * Helpers puros para trabajar con Candidato.
 *
 * Funciones puras (sin side effects, sin hooks) — se pueden importar desde
 * cualquier screen o componente sin acoplar a React ni al store.
 */

import type { Candidato } from "../api/endpoints";

/** Concatena nombre + apellido (sin espacios extra si falta el apellido). */
export function nombreCompleto(c: Candidato): string {
  return `${c.nombre}${c.apellido ? ` ${c.apellido}` : ""}`.trim();
}

/**
 * Iniciales de 1-2 caracteres para avatares.
 * Ej: "Juan Perez" -> "JP", "Ana" -> "A", "" -> "?".
 */
export function iniciales(c: Candidato): string {
  const first = c.nombre?.[0] ?? "";
  const last = c.apellido?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Sublabel opcional para cards de candidato: junta los tipos de eleccion
 * y el alcance territorial (si no es nacional) con " · " como separador.
 *
 * Ej:
 *   - ["Presidencial"] + "nacional"   -> "Presidencial"
 *   - ["Alcaldia"]     + "Providencia" -> "Alcaldia · Providencia"
 *   - []               + cualquiera    -> undefined
 */
export function sublabelCandidato(c: Candidato): string | undefined {
  const tipos = c.tipos_eleccion_nombres ?? [];
  if (tipos.length === 0) return undefined;
  if (c.alcance_territorial && c.alcance_territorial !== "nacional") {
    return `${tipos.join(" · ")} · ${c.alcance_territorial}`;
  }
  return tipos.join(" · ");
}
