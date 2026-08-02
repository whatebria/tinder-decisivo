/**
 * Feature flags del frontend.
 *
 * Para reactivar una feature: cambiar el valor a `true` y hacer deploy.
 * Para desactivar permanentemente: eliminar el flag y sus usos.
 *
 * Regla: ningun flag vive aqui mas de 2 sprints sin resolverse
 * (activarse definitivamente o eliminarse con su codigo).
 */

/**
 * SHOW_NOTICIAS — controla toda la UX de noticias en el frontend.
 *
 * Cuando es `false` se ocultan:
 *   - Tab "Noticias" del bottom nav / sidebar
 *   - Tab "Noticias" en el perfil de candidato
 *   - Tab "Noticias" en Mis Guardados
 *   - Seccion Novedades del Home (items de noticias)
 *   - Boton campana del HomeTopBar
 *
 * El codigo de las screens, hooks y endpoints se mantiene intacto.
 * Desactivado: 2026-07-30. Razon: contenido no listo para produccion.
 *
 * TASK-039: si esta feature no tiene fecha definida de activacion, evaluar
 * eliminar NoticiasTab, useNoticiasCandidato, NoticiasScreen y codigo
 * relacionado (YAGNI). Hacerlo en el mismo PR que esta decision de producto.
 */
export const SHOW_NOTICIAS = false;
