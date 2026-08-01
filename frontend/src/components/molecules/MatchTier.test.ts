/**
 * Tests unitarios para la logica de MatchTier.
 *
 * Testea tierFromPercent via getMatchTier del service -- verifica que
 * los thresholds de MatchTier son consistentes con DS-08 (TASK-018/019).
 *
 * Sin React, sin render. Solo input/output.
 */
import { getMatchTier } from "../../services/matching";
import type { MatchTierKind } from "./MatchTier";

// Replica de tierFromPercent para testear la logica pura
// (la funcion es interna al modulo, no se exporta).
function tierFromPercent(p: number): MatchTierKind {
  const t = getMatchTier(p);
  if (t === "aff5" || t === "aff4") return "high";
  if (t === "aff3") return "mid";
  return "low";
}

describe("MatchTier -- tierFromPercent (DS-08 thresholds via getMatchTier)", () => {
  describe("high (>=60%, aff4 o aff5)", () => {
    test("100% es high", () => expect(tierFromPercent(100)).toBe("high"));
    test("80% umbral aff5 es high", () => expect(tierFromPercent(80)).toBe("high"));
    test("79% aff4 es high", () => expect(tierFromPercent(79)).toBe("high"));
    test("60% umbral aff4 exacto es high", () => expect(tierFromPercent(60)).toBe("high"));
  });

  describe("mid (40-59%, aff3)", () => {
    test("59% justo debajo de high es mid", () => expect(tierFromPercent(59)).toBe("mid"));
    test("50% es mid", () => expect(tierFromPercent(50)).toBe("mid"));
    test("40% umbral aff3 exacto es mid", () => expect(tierFromPercent(40)).toBe("mid"));
  });

  describe("low (<40%, aff1 o aff2)", () => {
    test("39% justo debajo de mid es low", () => expect(tierFromPercent(39)).toBe("low"));
    test("20% es low", () => expect(tierFromPercent(20)).toBe("low"));
    test("0% es low", () => expect(tierFromPercent(0)).toBe("low"));
  });

  describe("thresholds NO deben ser los viejos (70/40 -- TASK-018 regression)", () => {
    test("69% era high en el sistema viejo (>=70), ahora es high (>=60)", () => {
      // Con thresholds viejos (70): 69% seria mid. Con DS-08 (60): es high (aff4).
      expect(tierFromPercent(69)).toBe("high");
    });
    test("71% sigue siendo high en ambos sistemas", () => {
      expect(tierFromPercent(71)).toBe("high");
    });
    test("60% era mid en el sistema viejo, ahora es high (DS-08)", () => {
      // Umbral viejo para high era 70. Umbral DS-08 es 60.
      expect(tierFromPercent(60)).toBe("high");
    });
  });
});
