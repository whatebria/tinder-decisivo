/**
 * blurActiveElement: helper puro que quita el foco al elemento activo del
 * documento, si es que hay uno focuseable (distinto de <body>).
 *
 * Cuando llamar:
 *   - Al INICIO de cualquier funcion que dispara el cierre de un overlay
 *     (Modal, BottomSheet, Sheet, popover, etc.) via `setState(false)` en
 *     el padre. Ejemplos tipicos: `onConfirm`, `onSubmit`, `handleSave`,
 *     `handleDelete`, `handleCancel`.
 *
 * Por que:
 *   En React Native Web, cuando un <Modal> pasa de `visible={true}` a
 *   `visible={false}`, RNW le aplica `display:none + aria-hidden="true"`
 *   al portal. Si el foco esta en un descendiente (ej: el propio boton
 *   que dispara el cierre), Chromium marca violacion de a11y:
 *
 *     "Blocked aria-hidden on an element because its descendant retained
 *      focus. Consider using the inert attribute instead."
 *
 *   Es violacion de WCAG 2.4.3 (Focus Order). La solucion es mover el
 *   foco a <body> ANTES de que se aplique el aria-hidden. Como el hide
 *   viene del `setState` del padre, tenemos que blurear ANTES de invocar
 *   la callback que provoca ese setState.
 *
 * Web-only: en RN native no existe `document`, el guard `typeof document`
 * hace que sea no-op.
 *
 * @example
 *   function handleConfirm() {
 *     blurActiveElement();
 *     onConfirm();  // el padre hara setOpen(false); ya no hay foco atrapado.
 *   }
 */
export function blurActiveElement(): void {
  if (typeof document === "undefined") return;
  const active = document.activeElement as HTMLElement | null;
  if (active && active !== document.body && typeof active.blur === "function") {
    active.blur();
  }
}
