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
 * ### Logica anti-apilamiento en reset
 *
 * Cuando el usuario presiona "Ver tours de nuevo", el store limpia `seen` y
 * actualiza `lastResetAt`. Si hay pantallas ya montadas con sus CoachMarkTour
 * activos, todos reaccionarian a `seen = {}` al mismo tiempo y se mostrarian
 * en pila. Para evitarlo:
 *
 *   - Cada instancia del hook captura su `mountedAt = Date.now()` en un ref
 *     al momento de montarse.
 *   - `visible` solo es `true` cuando `mountedAt >= lastResetAt`.
 *   - Los tours de pantallas ya montadas quedan suprimidos hasta que el
 *     usuario navegue a esa pantalla de nuevo (desmonta y remonta el hook,
 *     capturando un nuevo `mountedAt` posterior al reset).
 *
 * Uso tipico:
 *
 *   const tour = useCoachMarkTour("home");
 *   return (
 *     <>
 *       ...
 *       <CoachMark {...tour} />
 *     </>
 *   );
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const lastResetAt = useCoachMarksStore((s) => s.lastResetAt);
  const markSeen = useCoachMarksStore((s) => s.markSeen);

  // Capturamos el instante en que el componente se monto.
  // Si el usuario hace "Ver tours de nuevo" DESPUES de que este componente
  // ya estaba montado (lastResetAt > mountedAt), NO mostramos el tour:
  // el usuario tendra que navegar a esta pantalla de nuevo para verlo.
  // Cuando vuelva, el componente se remonta con un mountedAt nuevo, posterior
  // al reset, y el tour aparece con normalidad.
  const mountedAt = useRef(Date.now());

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!alreadySeen) setCurrentIndex(0);
  }, [alreadySeen]);

  const total = tour.steps.length;
  const isLast = currentIndex >= total - 1;

  const visible =
    isHydrated &&
    !alreadySeen &&
    // Solo muestra si el componente se monto DESPUES del ultimo reset.
    // Esto evita que los tours de pantallas ya montadas aparezcan todos
    // de golpe al hacer "Ver tours de nuevo" desde Config.
    mountedAt.current >= lastResetAt;

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
