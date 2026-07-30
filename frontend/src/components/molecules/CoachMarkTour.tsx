/**
 * CoachMarkTour: molécula wrapper que combina `useCoachMarkTour` + `<CoachMark />`.
 *
 * Existe para eliminar el boilerplate que aparecía en cada screen (7 props
 * copiadas del objeto tour + hook instanciado + fragment wrapper). Con esto,
 * el consumer solo escribe:
 *
 *     <CoachMarkTour tourId="noticias" />
 *
 * ...y todo lo demás (visibilidad según sesión, secuencia, marcar como visto)
 * queda encapsulado.
 *
 * ¿Por qué molécula y no organismo?
 *   Es una combinación pequeña de 1 hook + 1 átomo (CoachMark) sin lógica de
 *   negocio propia — solo cablea el hook. Encaja en la definición de molécula
 *   del atomic design que sigue este proyecto.
 *
 * ¿Por qué no hacerlo un HOC o un render-prop?
 *   Un componente concreto es más directo y testeable. Además el CoachMark
 *   necesita renderizarse como hermano del contenido (por el overlay full-screen),
 *   así que un HOC obligaría a envolver la screen entera — peor DX.
 */

import React from "react";

import type { TourId } from "../../content/coachMarks";
import { useCoachMarkTour } from "../../hooks/useCoachMarkTour";
import { CoachMark } from "./CoachMark";

export interface CoachMarkTourProps {
  /** ID del tour a orquestar. Debe existir en `COACH_TOURS`. */
  tourId: TourId;
}

export function CoachMarkTour({ tourId }: CoachMarkTourProps) {
  const tour = useCoachMarkTour(tourId);

  return (
    <CoachMark
      visible={tour.visible}
      step={tour.step}
      currentIndex={tour.currentIndex}
      total={tour.total}
      onNext={tour.next}
      onBack={tour.back}
      onSkip={tour.skip}
    />
  );
}
