/**
 * Tests unitarios puros para services/matching.ts.
 *
 * Sin React, sin render, sin API. Solo input/output.
 * Corren en milisegundos.
 */
import {
  formatMatchPercentage,
  getConfianzaBadge,
  getMatchColor,
  getMatchTier,
  sortByMatchDesc,
} from "./matching";
import { colors } from "../theme/colors";

describe("getMatchTier", () => {
  test("100% es tier alto", () => {
    expect(getMatchTier(100)).toBe("alto");
  });

  test("75% justo en el umbral es alto", () => {
    expect(getMatchTier(75)).toBe("alto");
  });

  test("74.9% es medio (justo debajo del umbral alto)", () => {
    expect(getMatchTier(74.9)).toBe("medio");
  });

  test("50% justo en el umbral es medio", () => {
    expect(getMatchTier(50)).toBe("medio");
  });

  test("49.9% es bajo (justo debajo del umbral medio)", () => {
    expect(getMatchTier(49.9)).toBe("bajo");
  });

  test("0% es bajo", () => {
    expect(getMatchTier(0)).toBe("bajo");
  });

  test.each([
    [0, "bajo"],
    [30, "bajo"],
    [49.99, "bajo"],
    [50, "medio"],
    [60, "medio"],
    [74.99, "medio"],
    [75, "alto"],
    [90, "alto"],
    [100, "alto"],
  ] as const)("pct=%p devuelve tier=%p", (pct, expected) => {
    expect(getMatchTier(pct)).toBe(expected);
  });
});

describe("getMatchColor", () => {
  test("alto usa color matchHigh", () => {
    expect(getMatchColor(90)).toBe(colors.matchHigh);
  });

  test("medio usa color matchMedium", () => {
    expect(getMatchColor(60)).toBe(colors.matchMedium);
  });

  test("bajo usa color matchLow", () => {
    expect(getMatchColor(30)).toBe(colors.matchLow);
  });
});

describe("formatMatchPercentage", () => {
  test("redondea al entero mas cercano", () => {
    expect(formatMatchPercentage(82.64)).toBe("83%");
  });

  test("no muestra decimales", () => {
    expect(formatMatchPercentage(75.0)).toBe("75%");
  });

  test("cero funciona", () => {
    expect(formatMatchPercentage(0)).toBe("0%");
  });

  test("cien funciona", () => {
    expect(formatMatchPercentage(100)).toBe("100%");
  });
});

describe("getConfianzaBadge", () => {
  test("ALTA devuelve badge success", () => {
    const badge = getConfianzaBadge("ALTA");
    expect(badge.label).toBe("Alta confianza");
    expect(badge.color).toBe(colors.success);
  });

  test("MEDIA devuelve badge warning", () => {
    const badge = getConfianzaBadge("MEDIA");
    expect(badge.label).toBe("Confianza media");
    expect(badge.color).toBe(colors.warning);
  });

  test("TENTATIVA devuelve badge danger", () => {
    const badge = getConfianzaBadge("TENTATIVA");
    expect(badge.label).toBe("Confianza tentativa");
    expect(badge.color).toBe(colors.danger);
  });

  test("acepta lowercase (backend puede mandar 'alta')", () => {
    expect(getConfianzaBadge("alta").label).toBe("Alta confianza");
  });

  test("undefined defaultea a TENTATIVA (defensivo)", () => {
    expect(getConfianzaBadge(undefined).label).toBe("Confianza tentativa");
  });

  test("valor invalido tambien defaultea a TENTATIVA", () => {
    expect(getConfianzaBadge("XYZ").label).toBe("Confianza tentativa");
  });
});

describe("sortByMatchDesc", () => {
  const mkResult = (pct: number, id: number) =>
    ({
      id,
      match_percentage: pct.toString(),
      candidato_data: { id, nombre: `C${id}`, apellido: "" },
    }) as any;

  test("ordena de mayor a menor porcentaje", () => {
    const input = [mkResult(30, 1), mkResult(90, 2), mkResult(60, 3)];
    const output = sortByMatchDesc(input);
    expect(output.map((r) => Number(r.match_percentage))).toEqual([90, 60, 30]);
  });

  test("array vacio devuelve array vacio", () => {
    expect(sortByMatchDesc([])).toEqual([]);
  });

  test("un solo item lo devuelve tal cual", () => {
    const input = [mkResult(50, 1)];
    expect(sortByMatchDesc(input)).toHaveLength(1);
    expect(sortByMatchDesc(input)[0].id).toBe(1);
  });

  test("no muta el input original (funcion pura)", () => {
    const input = [mkResult(30, 1), mkResult(90, 2)];
    const inputCopy = [...input];
    sortByMatchDesc(input);
    expect(input).toEqual(inputCopy);
  });

  test("maneja strings de porcentaje del backend", () => {
    // Backend devuelve DecimalField como string ("82.64")
    const input = [mkResult(82.64, 1), mkResult(90.01, 2)];
    const output = sortByMatchDesc(input);
    expect(output[0].id).toBe(2);
    expect(output[1].id).toBe(1);
  });
});
