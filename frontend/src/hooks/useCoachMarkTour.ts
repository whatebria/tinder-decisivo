/**
 * useCoachMarkTour: orquesta la secuencia de pasos de un coach mark tour.
 *
 * Responsabilidad única: exponer la máquina de estado (paso actual, avanzar,
 * retroceder, saltar) y decidir cuándo el overlay debe estar visible en base
 * al store persistido. NO renderiza UI — eso vive en <CoachMark />.
 *
 * El store esta persistido por identidad (userId o "guest") en secureStorage
 * (ver `store/coachMarks.ts`), asi que un tour visto queda visto entre
 * refreshes y reinicios de la app. Se re-muestra cuando:
 *   - Se hace `resetAll()` desde Config -> Ayuda
 *   - El user cambia de identidad y en esa identidad todavia no lo vio
 *
 * Uso típico:
 *
 *   const tour = useCoachMarkTour("home");
 *   return (
 *     <>
 *       ...
 *       <CoachMark {...tour} />
 *     </>
 *   );
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { COACH_TOURS, type CoachStep, type TourId } from "../content/coachMarks";
import { useCoachMarksStore } from "../store/coachMarks";

export interface UseCoachMarkTourResult {
  /** El overlay debe renderizarse. */
  visible: boolean;
  /** Paso actual — null cuando el tour no está activo. */
  step: CoachStep | null;
  /** Índice del paso actual, 0-based. */
  currentIndex: number;
  /** Cantidad total de pasos del tour. */
  total: number;
  /** Avanza al siguiente paso, o completa el tour si estamos en el último. */
  next: () => void;
  /** Vuelve al paso anterior. No-op en el primer paso. */
  back: () => void;
  /** Descarta el tour y lo marca como visto en la sesión actual. */
  skip: () => void;
}

export function useCoachMarkTour(tourId: TourId): UseCoachMarkTourResult {
  const tour = COACH_TOURS[tourId];
  const isHydrated = useCoachMarksStore((s) => s.isHydrated);
  const alreadySeen = useCoachMarksStore((s) => s.seen[tourId] === true);
  const markSeen = useCoachMarksStore((s) => s.markSeen);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Cuando el store se resetea (Config -> Ayuda o cambio de identidad), el
  // paso actual debe volver a 0 para que el usuario vea el tour desde el
  // inicio.
  useEffect(() => {
    if (!alreadySeen) setCurrentIndex(0);
  }, [alreadySeen]);

  const total = tour.steps.length;
  const isLast = currentIndex >= total - 1;
  // Safety net: si el store todavia no se hidrato, NO mostramos tours
  // (evita flash del tour cuando el user ya lo vio en una sesion previa).
  const visible = isHydrated && !alreadySeen;
  const step = visible ? tour.steps[currentIndex] : null;

  const next = useCallback(() => {
    if (isLast) {
      // markSeen es async pero no necesitamos esperar: la UI ya reacciona
      // al cambio del store.
      void markSeen(tourId);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast, markSeen, tourId]);

  const back = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  const skip = useCallback(() => {
    void markSeen(tourId);
  }, [markSeen, tourId]);

  return useMemo(
    () => ({ visible, step, currentIndex, total, next, back, skip }),
    [visible, step, currentIndex, total, next, back, skip],
  );
}
