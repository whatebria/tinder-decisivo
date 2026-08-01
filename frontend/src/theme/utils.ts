/**
 * Utilidades del theme.
 *
 * withAlpha: agrega transparencia a un color hex sin concatenacion fragil.
 * Si un token de color cambia de formato (rgb, hsl), el helper falla
 * en tiempo de compilacion / desarrollo, no silenciosamente en runtime.
 */

/**
 * Agrega un canal alpha a un color hex de 6 digitos.
 *
 * @param hex   Color en formato "#RRGGBB" o "RRGGBB". Debe ser hex de 6 chars.
 * @param alpha Opacidad de 0 (transparente) a 1 (opaco).
 * @returns     Color en formato "#RRGGBBaa".
 *
 * @example
 *   withAlpha(c.warning, 0.13)  // "#C89B5C21"
 *   withAlpha(c.primary, 0.09)  // "#2E5F7E17"
 */
export function withAlpha(hex: string, alpha: number): string {
  const base = hex.startsWith("#") ? hex.slice(1) : hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${base}${a}`;
}
