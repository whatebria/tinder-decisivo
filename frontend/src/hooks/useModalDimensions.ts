/**
 * useModalDimensions: calcula el maxWidth y maxHeight de un modal en base
 * al viewport actual + tokens de layout del theme.
 *
 * Regla: `min(viewport * ratio, cap absoluto)`. Ejemplos:
 *   - Mobile 812px de alto → 812 * 0.9 = 730 → cap 720 gana → 720
 *   - Phone chico 640px → 640 * 0.9 = 576 → ratio gana → 576
 *   - Desktop 1080p → 1080 * 0.9 = 972 → cap 720 gana → 720
 *
 * El hook se resuscribe a cambios de viewport (resize en web, rotacion
 * en native) via useWindowDimensions.
 *
 * Uso:
 *   const { maxWidth, maxHeight } = useModalDimensions();
 *   <View style={{ maxWidth, maxHeight }}>...</View>
 *
 * Consumidores: Modal.tsx (molecule central), ShareModal, BottomSheet
 * (para sheets usar useSheetDimensions).
 */
import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { modalLayout, sheetLayout } from "../theme/layout";

export interface ModalDimensions {
  maxWidth: number;
  maxHeight: number;
}

/**
 * Logica pura extraida del hook: dado un alto de viewport, computa las
 * dimensiones del modal. Exportada aparte para testear sin mockear
 * useWindowDimensions (que requiere el modulo native completo).
 */
export function computeModalDimensions(viewportHeight: number): ModalDimensions {
  return {
    maxWidth: modalLayout.maxWidth,
    maxHeight: Math.min(
      viewportHeight * modalLayout.maxHeightRatio,
      modalLayout.maxHeightAbsolute,
    ),
  };
}

/** Version pura del sheet: solo maxHeight, sin cap absoluto por diseno. */
export function computeSheetDimensions(viewportHeight: number): { maxHeight: number } {
  return { maxHeight: viewportHeight * sheetLayout.maxHeightRatio };
}

export function useModalDimensions(): ModalDimensions {
  const { height } = useWindowDimensions();
  return useMemo(() => computeModalDimensions(height), [height]);
}

/**
 * Version para bottom sheets: mismo pattern pero con el ratio de sheets
 * (mas restrictivo, deja mas app visible detras). Sin cap absoluto: los
 * sheets pueden ocupar mas alto en desktop, no queremos limitarlos.
 */
export function useSheetDimensions(): { maxHeight: number } {
  const { height } = useWindowDimensions();
  return useMemo(() => computeSheetDimensions(height), [height]);
}
