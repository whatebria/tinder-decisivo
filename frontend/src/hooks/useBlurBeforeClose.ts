/**
 * useBlurBeforeClose: envuelve un `onClose` de modal para hacer blur() al
 * elemento con foco antes de cerrar.
 *
 * Motivo: en React Native Web, `<Modal visible={false}>` esconde el nodo
 * con `display:none + aria-hidden="true"`. Si el foco estaba en un botoncito
 * interno (ej: IconButton de cerrar, item de picker, boton del footer), el
 * screen reader se queja: "Blocked aria-hidden on an element because its
 * descendant retained focus" — es violacion de WCAG 2.4.3.
 *
 * El fix: antes de invocar el `onClose` del consumidor, movemos el foco a
 * `body` con `activeElement.blur()`. Native (iOS/Android) es no-op — RN nativo
 * maneja el foco a mano y no expone `document`, asi que el guard `typeof
 * document !== "undefined"` cubre eso.
 *
 * Uso:
 *   const handleClose = useBlurBeforeClose(onClose);
 *   return <Modal onClose={handleClose} .../>;
 */

import { useCallback } from "react";

export function useBlurBeforeClose(onClose: () => void): () => void {
  return useCallback(() => {
    if (typeof document !== "undefined") {
      const active = document.activeElement as HTMLElement | null;
      // body y null son no-op; solo blur si hay un elemento focusable real.
      if (active && active !== document.body && typeof active.blur === "function") {
        active.blur();
      }
    }
    onClose();
  }, [onClose]);
}
