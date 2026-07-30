/**
 * Tests del coachMarks store.
 *
 * Store persistido por identidad (userId o "guest") en secureStorage.
 * Cubre: hydrate, hasSeen, markSeen (idempotente + persistencia),
 * resetAll (con borrado de storage), aislamiento entre identidades,
 * y robustez frente a JSON corrupto en storage.
 */

import type { TourId } from "../content/coachMarks";
import { useCoachMarksStore } from "./coachMarks";
import { secureStorage } from "./secureStorage";

// Mockeamos secureStorage con un backend in-memory para no tocar disco.
jest.mock("./secureStorage", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    secureStorage: {
      getItem: jest.fn(async (key: string) => store.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  };
});

// Handle tipado para poder limpiar el backend mockeado entre tests.
const mockedStorage = secureStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
};
const mockedBackend = (
  jest.requireMock("./secureStorage") as { __store: Map<string, string> }
).__store;

beforeEach(() => {
  mockedBackend.clear();
  mockedStorage.getItem.mockClear();
  mockedStorage.setItem.mockClear();
  mockedStorage.removeItem.mockClear();
  useCoachMarksStore.setState({
    seen: {},
    isHydrated: false,
    currentUserId: null,
  });
});

describe("useCoachMarksStore", () => {
  describe("estado inicial", () => {
    it("arranca con el mapa vacio y sin hidratar", () => {
      const s = useCoachMarksStore.getState();
      expect(s.seen).toEqual({});
      expect(s.isHydrated).toBe(false);
      expect(s.currentUserId).toBeNull();
    });

    it("hasSeen devuelve false para cualquier tour antes de hydrate", () => {
      const { hasSeen } = useCoachMarksStore.getState();
      expect(hasSeen("home")).toBe(false);
      expect(hasSeen("cuestionario")).toBe(false);
    });
  });

  describe("hydrateFor", () => {
    it("carga la lista vacia si no hay nada en storage y marca isHydrated", async () => {
      await useCoachMarksStore.getState().hydrateFor(42);
      const s = useCoachMarksStore.getState();
      expect(s.seen).toEqual({});
      expect(s.isHydrated).toBe(true);
      expect(s.currentUserId).toBe(42);
      expect(mockedStorage.getItem).toHaveBeenCalledWith(
        "servel_coach_marks_seen_42",
      );
    });

    it("carga tours vistos previamente para el userId", async () => {
      mockedBackend.set(
        "servel_coach_marks_seen_7",
        JSON.stringify({ home: true, resultados: true }),
      );
      await useCoachMarksStore.getState().hydrateFor(7);
      expect(useCoachMarksStore.getState().seen).toEqual({
        home: true,
        resultados: true,
      });
    });

    it("usa la key 'guest' cuando userId es null", async () => {
      mockedBackend.set(
        "servel_coach_marks_seen_guest",
        JSON.stringify({ noticias: true }),
      );
      await useCoachMarksStore.getState().hydrateFor(null);
      expect(useCoachMarksStore.getState().seen).toEqual({ noticias: true });
      expect(useCoachMarksStore.getState().currentUserId).toBeNull();
    });

    it("aisla identidades: cambiar de userId recarga desde otra key", async () => {
      mockedBackend.set(
        "servel_coach_marks_seen_1",
        JSON.stringify({ home: true }),
      );
      mockedBackend.set(
        "servel_coach_marks_seen_2",
        JSON.stringify({ comparador: true }),
      );

      await useCoachMarksStore.getState().hydrateFor(1);
      expect(useCoachMarksStore.getState().seen).toEqual({ home: true });

      await useCoachMarksStore.getState().hydrateFor(2);
      expect(useCoachMarksStore.getState().seen).toEqual({ comparador: true });
    });

    it("recupera de JSON corrupto sin crashear", async () => {
      mockedBackend.set("servel_coach_marks_seen_9", "{ not json");
      await useCoachMarksStore.getState().hydrateFor(9);
      expect(useCoachMarksStore.getState().seen).toEqual({});
      expect(useCoachMarksStore.getState().isHydrated).toBe(true);
    });

    it("ignora payloads que no sean objeto plain (array, string, etc)", async () => {
      mockedBackend.set(
        "servel_coach_marks_seen_5",
        JSON.stringify(["home", "resultados"]),
      );
      await useCoachMarksStore.getState().hydrateFor(5);
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });
  });

  describe("markSeen", () => {
    beforeEach(async () => {
      await useCoachMarksStore.getState().hydrateFor(100);
      mockedStorage.setItem.mockClear();
    });

    it("marca un tour como visto en memoria", async () => {
      await useCoachMarksStore.getState().markSeen("home");
      expect(useCoachMarksStore.getState().hasSeen("home")).toBe(true);
    });

    it("persiste a storage en la key de la identidad actual", async () => {
      await useCoachMarksStore.getState().markSeen("home");
      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        "servel_coach_marks_seen_100",
        JSON.stringify({ home: true }),
      );
    });

    it("es idempotente: llamar dos veces no re-escribe storage", async () => {
      await useCoachMarksStore.getState().markSeen("resultados");
      const seenAfterFirst = useCoachMarksStore.getState().seen;
      await useCoachMarksStore.getState().markSeen("resultados");
      const seenAfterSecond = useCoachMarksStore.getState().seen;
      expect(seenAfterSecond).toBe(seenAfterFirst);
      // 1 write, no 2.
      expect(mockedStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it("preserva tours previos al marcar uno nuevo", async () => {
      await useCoachMarksStore.getState().markSeen("home");
      await useCoachMarksStore.getState().markSeen("comparador");
      expect(useCoachMarksStore.getState().seen).toEqual({
        home: true,
        comparador: true,
      });
    });

    it("no crashea si storage falla al escribir", async () => {
      mockedStorage.setItem.mockRejectedValueOnce(new Error("disk full"));
      await expect(
        useCoachMarksStore.getState().markSeen("noticias"),
      ).resolves.toBeUndefined();
      // El estado en memoria igual se actualiza.
      expect(useCoachMarksStore.getState().hasSeen("noticias")).toBe(true);
    });
  });

  describe("resetAll", () => {
    beforeEach(async () => {
      mockedBackend.set(
        "servel_coach_marks_seen_50",
        JSON.stringify({ home: true, resultados: true }),
      );
      await useCoachMarksStore.getState().hydrateFor(50);
      mockedStorage.removeItem.mockClear();
    });

    it("limpia todos los tours marcados en memoria", async () => {
      await useCoachMarksStore.getState().resetAll();
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });

    it("borra la key de storage de la identidad actual", async () => {
      await useCoachMarksStore.getState().resetAll();
      expect(mockedStorage.removeItem).toHaveBeenCalledWith(
        "servel_coach_marks_seen_50",
      );
      expect(mockedBackend.has("servel_coach_marks_seen_50")).toBe(false);
    });

    it("permite volver a marcar tours despues del reset", async () => {
      await useCoachMarksStore.getState().resetAll();
      await useCoachMarksStore.getState().markSeen("home");
      expect(useCoachMarksStore.getState().hasSeen("home")).toBe(true);
    });

    it("no crashea si storage falla al borrar", async () => {
      mockedStorage.removeItem.mockRejectedValueOnce(new Error("nope"));
      await expect(
        useCoachMarksStore.getState().resetAll(),
      ).resolves.toBeUndefined();
      expect(useCoachMarksStore.getState().seen).toEqual({});
    });
  });

  describe("cobertura de tourIds validos", () => {
    // Guardia: si manana alguien agrega un TourId nuevo al content, este
    // test seguira pasando pero deja constancia de que IDs debe soportar el store.
    const IDS: TourId[] = [
      "home",
      "cuestionario",
      "resultados",
      "comparador",
      "guardados",
      "gestionElecciones",
      "perfilCandidato",
      "noticias",
    ];

    beforeEach(async () => {
      await useCoachMarksStore.getState().hydrateFor(1);
    });

    it.each(IDS)("puede marcar y consultar %s", async (id) => {
      await useCoachMarksStore.getState().markSeen(id);
      expect(useCoachMarksStore.getState().hasSeen(id)).toBe(true);
    });
  });
});
