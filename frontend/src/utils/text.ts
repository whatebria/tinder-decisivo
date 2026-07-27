/**
 * Helpers de manipulacion de strings compartidos entre screens.
 */

/**
 * Limpia texto que puede venir con markup HTML crudo desde el scraper del
 * backend (ej: <a href="...">link</a>, <br>, &amp;, &nbsp;). React Native
 * Text no parsea HTML, asi que sin esto las tags se ven literalmente.
 *
 * Estrategia minima:
 *   1. Reemplaza <br> por espacio (comun en descripciones scrapeadas)
 *   2. Remueve todas las tags <...>
 *   3. Decodifica un set corto de entidades HTML basicas
 *   4. Colapsa whitespace y trim
 *
 * No intenta ser un parser HTML completo — solo limpia el 90% de los casos
 * comunes de contenido scrapeado. Para casos raros (entidades exoticas)
 * degrada elegante: deja el texto tal cual esta.
 */
export function sanitizeSnippet(raw?: string): string {
  if (!raw) return "";
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
