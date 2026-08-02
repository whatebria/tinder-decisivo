/**
 * user.ts — Helpers de presentacion derivados del perfil de usuario.
 *
 * Funciones puras extraidas de HomeScreen para permitir testing unitario
 * y evitar duplicacion si se usan en otras pantallas (Perfil, Config).
 *
 * Sin dependencias de React ni de la API.
 */

/**
 * Extrae el prefijo de un email (parte antes del @).
 * Util unica para que los callers no dupliquen email.split("@")[0] (TASK-051).
 *
 * @example
 *   extractEmailPrefix("jenny@walmart.com") -> "jenny"
 *   extractEmailPrefix("jenny")             -> "jenny"  (sin @ devuelve tal cual)
 */
export function extractEmailPrefix(email: string): string {
  return email.includes("@") ? email.split("@")[0] : email;
}

/**
 * Deriva las iniciales del usuario a partir del email o prefijo del email.
 * Acepta el email completo (con @) o solo el prefijo.
 * Se toman las primeras letras de los segmentos separados por ".".
 *
 * @example
 *   deriveInitials("jenny.venegas@walmart.com") -> "JV"
 *   deriveInitials("jenny.venegas")   -> "JV"
 *   deriveInitials("jenny")           -> "J"
 *   deriveInitials("jenny.venegas.garcia") -> "JV"  (solo las 2 primeras)
 *   deriveInitials("")                -> "?"
 */
export function deriveInitials(emailOrPrefix: string): string {
  const prefix = extractEmailPrefix(emailOrPrefix);
  const parts = prefix.split(".").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Extrae el primer nombre de un email o prefijo de email.
 * Acepta el email completo (con @) o solo el prefijo.
 * Usa el primer segmento antes del primer punto.
 *
 * @example
 *   deriveDisplayName("jenny.venegas@walmart.com") -> "jenny"
 *   deriveDisplayName("jenny.venegas") -> "jenny"
 *   deriveDisplayName("jenny")         -> "jenny"
 *   deriveDisplayName("")              -> ""
 */
export function deriveDisplayName(emailOrPrefix: string): string {
  const prefix = extractEmailPrefix(emailOrPrefix);
  return prefix.split(".")[0];
}

/**
 * Saludo contextual segun la hora del sistema.
 * Exportada para permitir testing con inyeccion de hora.
 *
 * @param hour — hora (0-23). Default: hora actual del sistema.
 */
export function greetingForHour(hour?: number): string {
  const h = hour ?? new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}
