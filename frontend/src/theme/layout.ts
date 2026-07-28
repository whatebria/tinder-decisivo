/**
 * Layout tokens para overlays (modales, bottom sheets, popovers).
 *
 * Single source of truth para tamanos de superficies flotantes. Cualquier
 * componente que dibuje una superficie que puede ser mas grande que el
 * viewport DEBE consumir estos valores via `useModalDimensions()` en vez
 * de hardcodear numeros.
 *
 * Racional de los defaults:
 * - maxHeightRatio 0.90: deja ~5% de aire arriba y abajo, suficiente para
 *   que el backdrop se vea (no full-bleed) sin desperdiciar espacio en
 *   pantallas chicas.
 * - maxHeightAbsolute 720: cap para desktop. Sin esto un modal en 1080p
 *   quedaria de ~970px de alto, feisimo. 720 es el sweet spot para leer
 *   comodamente sin scroll infinito.
 * - maxWidth 480: patron industry-standard para dialogs; encima queda
 *   tipo landing page, debajo queda apretado.
 * - Sheet ratio 0.85: los bottom sheets se anclan al fondo, dejan mas
 *   aire arriba (donde se ve la app detras) para dar contexto visual.
 */
export const modalLayout = {
  maxWidth: 480,
  maxHeightRatio: 0.9,
  maxHeightAbsolute: 720,
} as const;

export const sheetLayout = {
  /** Ratio del alto de la ventana al que se limita el bottom sheet. */
  maxHeightRatio: 0.85,
} as const;

export type ModalLayoutKey = keyof typeof modalLayout;
export type SheetLayoutKey = keyof typeof sheetLayout;
