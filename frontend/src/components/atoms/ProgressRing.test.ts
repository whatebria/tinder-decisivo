/**
 * Tests de atoms/ProgressRing.tsx — funcion pura deriveState.
 *
 * deriveState(value, explicit?) : ProgressRingState
 *
 * Reglas de negocio:
 *   value >= 1   -> "done"
 *   value > 0    -> "progress"
 *   value <= 0   -> "pending"
 *   explicit != null -> siempre retorna explicit (override)
 */

import { deriveState } from "./ProgressRing";

describe("deriveState", () => {
  describe("sin explicit (inferencia automatica)", () => {
    it("0 -> pending", () => {
      expect(deriveState(0)).toBe("pending");
    });

    it("negativo -> pending (defensivo)", () => {
      expect(deriveState(-0.1)).toBe("pending");
    });

    it("entre 0 y 1 (exclusivo) -> progress", () => {
      expect(deriveState(0.01)).toBe("progress");
      expect(deriveState(0.5)).toBe("progress");
      expect(deriveState(0.99)).toBe("progress");
    });

    it("exactamente 1 -> done", () => {
      expect(deriveState(1)).toBe("done");
    });

    it("> 1 -> done (defensivo)", () => {
      expect(deriveState(1.5)).toBe("done");
    });
  });

  describe("con explicit (override)", () => {
    it("explicit='done' sobreescribe aunque value sea 0", () => {
      expect(deriveState(0, "done")).toBe("done");
    });

    it("explicit='pending' sobreescribe aunque value sea 1", () => {
      expect(deriveState(1, "pending")).toBe("pending");
    });

    it("explicit='progress' sobreescribe cualquier valor", () => {
      expect(deriveState(0, "progress")).toBe("progress");
      expect(deriveState(1, "progress")).toBe("progress");
    });
  });
});
