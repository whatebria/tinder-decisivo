/**
 * Constantes de validación compartidas entre componentes de autenticación.
 *
 * Single source of truth para reglas de validación client-side. Si el backend
 * cambia un umbral (ej. MinimumLengthValidator en AUTH_PASSWORD_VALIDATORS),
 * solo hay que actualizar aquí y todos los componentes quedan alineados.
 *
 * Backend equivalente: backend/api/settings.py > AUTH_PASSWORD_VALIDATORS
 */

/** Longitud mínima de contraseña. Debe coincidir con MinimumLengthValidator del backend. */
export const PASSWORD_MIN_LENGTH = 10;

/** Mensaje de helper para campos de contraseña nueva. */
export const PASSWORD_MIN_LENGTH_MSG = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
