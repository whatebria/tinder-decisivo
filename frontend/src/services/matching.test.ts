/**
 * Tests unitarios puros para services/matching.ts.
 *
 * Sin React, sin render, sin API. Solo input/output.
 * Corren en milisegundos.
 */
import {
  formatMatchPercentage,
  getConfianzaBadge,
  getLikertColor,
  getMatchColor,
  getMatchTier,
  sortByMatchDesc,
} from "./matching";
import { colors, affinity } from "../theme/colors";

describe("getMatchTier", () => {
  test("100% es aff5 (verde vibrante)", () => {
    expect(getMatchTier(100)).toBe("aff5");
  });

  test("80% umbral t5 exacto es aff5", () => {
    expect(getMatchTier(80)).toBe("aff5");
  });

  test("79% justo debajo del umbral t5 es aff4", () => {
    expect(getMatchTier(79)).toBe("aff4");
  });

  test("60% umbral t4 exacto es aff4", () => {
    expect(getMatchTier(60)).toBe("aff4");
  });

  test("59% justo debajo del umbral t4 es aff3", () => {
    expect(getMatchTier(59)).toBe("aff3");
  });

  test("40% umbral t3 exacto es aff3", () => {
    expect(getMatchTier(40)).toBe("aff3");
  });

  test("39% justo debajo del umbral t3 es aff2", () => {
    expect(getMatchTier(39)).toBe("aff2");
  });

  test("20% umbral t2 exacto es aff2", () => {
    expect(getMatchTier(20)).toBe("aff2");
  });

  test("19% justo debajo del umbral t2 es aff1", () => {
    expect(getMatchTier(19)).toBe("aff1");
  });

  test("0% es aff1 (terracota)", () => {
    expect(getMatchTier(0)).toBe("aff1");
  });

  test.each([
    [0,   "aff1"],
    [10,  "aff1"],
    [19,  "aff1"],
    [20,  "aff2"],
    [30,  "aff2"],
    [39,  "aff2"],
    [40,  "aff3"],
    [50,  "aff3"],
    [59,  "aff3"],
    [60,  "aff4"],
    [70,  "aff4"],
    [79,  "aff4"],
    [80,  "aff5"],
    [90,  "aff5"],
    [100, "aff5"],
  ] as const)("pct=%p devuelve tier=%p (DS-08)", (pct, expected) => {
    expect(getMatchTier(pct)).toBe(expected);
  });
});

describe("getMatchColor", () => {
  test("aff5 (80+%): verde vibrante = affinity.aff5", () => {
    expect(getMatchColor(90)).toBe(affinity.aff5);  // #3A9E7A
  });

  test("aff5 umbral exacto (80%)", () => {
    expect(getMatchColor(80)).toBe(affinity.aff5);
  });

  test("aff4 (60-79%): verde bosque = affinity.aff4", () => {
    expect(getMatchColor(70)).toBe(affinity.aff4);  // #6B9B7A
  });

  test("aff3 (40-59%): mostaza = affinity.aff3", () => {
    expect(getMatchColor(50)).toBe(affinity.aff3);  // #C89B5C
  });

  test("aff2 (20-39%): terracota suave = affinity.aff2", () => {
    expect(getMatchColor(30)).toBe(affinity.aff2);  // #D07777 (antes: danger #B85C5C)
  });

  test("aff1 (0-19%): terracota = affinity.aff1", () => {
    expect(getMatchColor(10)).toBe(affinity.aff1);  // #B85C5C
  });

  test("90% no devuelve success del theme (bug DS-08 corregido)", () => {
    expect(getMatchColor(90)).not.toBe(colors.success);
    expect(getMatchColor(90)).toBe(affinity.aff5);
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

describe("getLikertColor", () => {
  // Escala Likert del backend: 1=muy en desacuerdo, 3=neutral, 5=muy de acuerdo.
  // En light bg: extremos usan tints oscuros (mayor contraste).
  // En dark  bg: extremos usan tints claros  (mayor contraste).

  describe("light mode (isDark=false)", () => {
    test("5 (muy de acuerdo) retorna verde fuerte", () => {
      expect(getLikertColor(5, colors, false)).toBe(colors.success600);
    });
    test("4 (de acuerdo) retorna verde base", () => {
      expect(getLikertColor(4, colors, false)).toBe(colors.success);
    });
    test("3 (neutral) retorna textSecondary", () => {
      expect(getLikertColor(3, colors, false)).toBe(colors.textSecondary);
    });
    test("2 (en desacuerdo) retorna rojo base", () => {
      expect(getLikertColor(2, colors, false)).toBe(colors.danger);
    });
    test("1 (muy en desacuerdo) retorna rojo fuerte", () => {
      expect(getLikertColor(1, colors, false)).toBe(colors.danger600);
    });
  });

  describe("dark mode (isDark=true)", () => {
    test("5 usa tint claro success200 para contraste sobre bg oscuro", () => {
      expect(getLikertColor(5, colors, true)).toBe(colors.success200);
    });
    test("4 usa success base (igual en ambos modos)", () => {
      expect(getLikertColor(4, colors, true)).toBe(colors.success);
    });
    test("3 sigue siendo textSecondary", () => {
      expect(getLikertColor(3, colors, true)).toBe(colors.textSecondary);
    });
    test("2 usa danger base (igual en ambos modos)", () => {
      expect(getLikertColor(2, colors, true)).toBe(colors.danger);
    });
    test("1 usa tint claro danger200 para contraste sobre bg oscuro", () => {
      expect(getLikertColor(1, colors, true)).toBe(colors.danger200);
    });
  });

  describe("valores fuera de rango", () => {
    test("0 defaultea a textSecondary (defensivo)", () => {
      expect(getLikertColor(0, colors, false)).toBe(colors.textSecondary);
    });
    test("6 defaultea a textSecondary (defensivo)", () => {
      expect(getLikertColor(6, colors, false)).toBe(colors.textSecondary);
    });
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
