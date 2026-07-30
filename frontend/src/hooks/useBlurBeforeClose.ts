/**
 * useBlurBeforeClose: envuelve un `onClose` void para hacer blur al elemento
 * activo antes de invocarlo.
 *
 * Es un wrapper de conveniencia del helper `blurActiveElement`, pensado para
 * el caso mas comun: el `onClose` prop del `<Modal>` base (que se invoca sin
 * argumentos desde el boton X del header y desde el backdrop). Devuelve
 * referencia estable via `useCallback` para no romper memoizaciones.
 *
 * Cuando NO usar este hook:
 *   Si tu handler recibe argumentos (ej: `handleSubmit(opcionId, peso)`) o
 *   captura state con clausura (ej: `onSubmit(current, next)`), envolver todo
 *   con este hook es ruido. Preferi llamar `blurActiveElement()` inline al
 *   inicio del handler:
 *
 *     function handleSubmit() {
 *       blurActiveElement();
 *       onSubmit(opcionId, peso);
 *     }
 *
 * Contexto (por que existe todo esto):
 *   En React Native Web, `<Modal visible={false}>` esconde el nodo con
 *   `display:none + aria-hidden="true"`. Si el foco esta en un descendiente
 *   (boton confirmar, item de picker, IconButton de cerrar), Chromium marca:
 *
 *     "Blocked aria-hidden on an element because its descendant retained
 *      focus. Consider using the inert attribute instead."
 *
 *   Es violacion de WCAG 2.4.3. El fix: mover el foco a <body> ANTES de que
 *   se aplique el aria-hidden — o sea, antes del `setState(false)` del padre
 *   que dispara el cierre.
 *
 *   Los modals wrappers de dominio (ConfirmModal, EditarRespuestaModal,
 *   CambiarPasswordModal, EliminarCuentaModal) tienen callbacks `onConfirm`
 *   / `onSubmit` que NO pasan por este hook — por eso cada uno llama
 *   `blurActiveElement()` inline en su handler.
 *
 *   Native (iOS/Android) es no-op — RN nativo maneja el foco a mano y no
 *   expone `document`.
 *
 * @example
 *   // Uso tipico: cerrar modal por boton X o backdrop.
 *   const handleClose = useBlurBeforeClose(onClose);
 *   return <Modal onClose={handleClose} />;
 */

import { useCallback } from "react";

import { blurActiveElement } from "./blurActiveElement";

export function useBlurBeforeClose(onClose: () => void): () => void {
  return useCallback(() => {
    blurActiveElement();
    onClose();
  }, [onClose]);
}
