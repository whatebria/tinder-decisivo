/**
 * Helpers puros para armar el texto de "compartir mis matches" + wrappers
 * de Web Share API / Clipboard con fallback graceful.
 *
 * El texto se disenio para ser legible en WhatsApp, X, mail, etc. Sin
 * markdown ni emojis (para no romper en apps que no los renderizan bien).
 */

import type { MatchResult } from "../api/endpoints";

// URL publica configurable por entorno. Staging/previews deben setear
// EXPO_PUBLIC_APP_URL para no mandar links de produccion en QA.
const APP_URL =
  process.env.EXPO_PUBLIC_APP_URL ?? "https://votoafin.cl";

// Cuantos matches meter en el texto compartido.
const TOP_N = 5;

// ---------------------------------------------------------------------------
// Formato del texto
// ---------------------------------------------------------------------------

/** Shape minimo que necesita buildShareText. Deliberadamente independiente
 * de MatchResult para permitir tests con mocks simples y evitar acoplarse al
 * schema autogenerado. */
export interface ShareableMatch {
  match_percentage: string | number;
  candidato_data: {
    nombre?: string;
    apellido?: string;
    partido?: string | null;
  };
}

export interface ShareTextInput {
  tipoNombre: string;
  matches: ShareableMatch[];
}

/** Adapter type-safe: si MatchResult cambia, TypeScript marca el error aqui,
 *  no silenciosamente en runtime. */
export function fromMatchResults(matches: MatchResult[]): ShareableMatch[] {
  return matches.map((m) => ({
    match_percentage: m.match_percentage,
    candidato_data: {
      nombre:   m.candidato_data.nombre,
      apellido: m.candidato_data.apellido,
      partido:  m.candidato_data.partido ?? null,
    },
  }));
}

/**
 * Arma el texto para compartir. Toma el top N por porcentaje.
 *
 * Ejemplo:
 *
 *   Mis matches en VotoAFin - Presidencial 2025:
 *
 *   1. Ana Perez (Partido A) - 75%
 *   2. Bea Lopez (Partido B) - 68%
 *   3. Carla Rios (Partido C) - 52%
 *
 *   Encuentra tu match en https://votoafin.cl
 */
export function buildShareText({ tipoNombre, matches }: ShareTextInput): string {
  const header = `Mis matches en VotoAFin - ${tipoNombre}:`;
  const top = [...matches]
    .sort((a, b) => Number(b.match_percentage) - Number(a.match_percentage))
    .slice(0, TOP_N);

  if (top.length === 0) {
    return `${header}\n\n(Sin matches todavia)\n\nEncuentra tu match en ${APP_URL}`;
  }

  const lines = top.map((m, idx) => {
    const c = m.candidato_data ?? {};
    const nombre = `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim();
    const partido = c.partido ? ` (${c.partido})` : "";
    const pct = Math.round(Number(m.match_percentage));
    return `${idx + 1}. ${nombre}${partido} - ${pct}%`;
  });

  return `${header}\n\n${lines.join("\n")}\n\nEncuentra tu match en ${APP_URL}`;
}

// ---------------------------------------------------------------------------
// Wrappers de plataforma (Web Share API + Clipboard)
// ---------------------------------------------------------------------------

/** True si el navegador soporta navigator.share (Chrome mobile, Safari, etc). */
export function canShareNative(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof (navigator as Navigator).share === "function";
}

/**
 * Intenta compartir con la API nativa del navegador/OS. Devuelve true si
 * arranco el share, false si no esta soportado o fue cancelado.
 */
export async function shareNative(text: string, title = "VotoAFin"): Promise<boolean> {
  if (!canShareNative()) return false;
  try {
    await (navigator as Navigator).share({ title, text });
    return true;
  } catch {
    // Usuario cancelo o error de permisos: silencioso.
    return false;
  }
}

/** Copia texto al portapapeles. Devuelve true si funciono. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
