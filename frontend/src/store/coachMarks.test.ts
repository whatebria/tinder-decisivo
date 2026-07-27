/**
 * Tests del coachMarks store.
 *
 * El store es puramente in-memory (ligado a la sesión, no se persiste).
 * Cubre: estado inicial vacío, `hasSeen`, `markSeen` idempotente, `resetAll`,
 * y aislamiento entre tourIds.
 */

import type { TourId } from "../content/coachMarks";
import { useCoachMarksStore } from "./coachMarks";

function resetStore() {
  useCoachMarksStore.setState({ seen: {} });
}

beforeEach(() => {
  resetStore();
});

describe("useCoachMarksStore", () => {
  describe("estado inicial", () => {
    it("arranca con el mapa vacío", () => {
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });

    it("hasSeen devuelve false para cualquier tour antes del primer markSeen", () => {
      const { hasSeen } = useCoachMarksStore.getState();
      expect(hasSeen("home")).toBe(false);
      expect(hasSeen("cuestionario")).toBe(false);
      expect(hasSeen("resultados")).toBe(false);
      expect(hasSeen("comparador")).toBe(false);
    });
  });

  describe("markSeen", () => {
    it("marca un tour como visto", () => {
      useCoachMarksStore.getState().markSeen("home");
      expect(useCoachMarksStore.getState().hasSeen("home")).toBe(true);
    });

    it("no toca otros tours al marcar uno", () => {
      useCoachMarksStore.getState().markSeen("home");
      expect(useCoachMarksStore.getState().hasSeen("comparador")).toBe(false);
    });

    it("es idempotente: llamar dos veces no cambia el estado", () => {
      useCoachMarksStore.getState().markSeen("resultados");
      const seenAfterFirst = useCoachMarksStore.getState().seen;
      useCoachMarksStore.getState().markSeen("resultados");
      const seenAfterSecond = useCoachMarksStore.getState().seen;
      // Misma referencia = no hubo re-render innecesario del store.
      expect(seenAfterSecond).toBe(seenAfterFirst);
    });

    it("preserva tours previos al marcar uno nuevo", () => {
      useCoachMarksStore.getState().markSeen("home");
      useCoachMarksStore.getState().markSeen("comparador");
      expect(useCoachMarksStore.getState().seen).toEqual({
        home: true,
        comparador: true,
      });
    });
  });

  describe("resetAll", () => {
    it("limpia todos los tours marcados", () => {
      useCoachMarksStore.getState().markSeen("home");
      useCoachMarksStore.getState().markSeen("resultados");
      useCoachMarksStore.getState().resetAll();
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });

    it("permite volver a marcar tours después del reset", () => {
      useCoachMarksStore.getState().markSeen("home");
      useCoachMarksStore.getState().resetAll();
      useCoachMarksStore.getState().markSeen("home");
      expect(useCoachMarksStore.getState().hasSeen("home")).toBe(true);
    });

    it("es idempotente sobre estado vacío", () => {
      useCoachMarksStore.getState().resetAll();
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });
  });

  describe("cobertura de tourIds válidos", () => {
    // Guardia: si mañana alguien agrega un TourId nuevo al content, este
    // test seguirá pasando pero deja constancia de qué IDs debe soportar el store.
    const IDS: TourId[] = ["home", "cuestionario", "resultados", "comparador"];

    it.each(IDS)("puede marcar y consultar %s", (id) => {
      useCoachMarksStore.getState().markSeen(id);
      expect(useCoachMarksStore.getState().hasSeen(id)).toBe(true);
    });
  });
});
