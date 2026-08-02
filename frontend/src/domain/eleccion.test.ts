/**
 * Tests del dominio de elecciones.
 *
 * Todas las funciones son puras — sin mock de Date, sin renderer, sin API.
 */

import {
  computeDiasRestantes,
  computeProgresoRatio,
  deriveEleccionEstado,
  formatDiasRestantesChip,
  formatProgresoLabel,
  requiereFiltroTerritorial,
} from "./eleccion";

describe("deriveEleccionEstado", () => {
  test("sin_empezar cuando respondidas=0", () => {
    expect(deriveEleccionEstado({ respondidas: 0, total: 12 })).toBe("sin_empezar");
  });

describe("requiereFiltroTerritorial", () => {
  // Casos que NO requieren filtro (alcance nacional)
  test("false para 'Presidencial 2025'", () => {
    expect(requiereFiltroTerritorial("Presidencial 2025")).toBe(false);
  });

  test("false para 'presidencial' (case-insensitive)", () => {
    expect(requiereFiltroTerritorial("presidencial")).toBe(false);
  });

  test("false para 'Plebiscito Nacional'", () => {
    expect(requiereFiltroTerritorial("Plebiscito Nacional")).toBe(false);
  });

  test("false para 'PLEBISCITO' (case-insensitive)", () => {
    expect(requiereFiltroTerritorial("PLEBISCITO")).toBe(false);
  });

  // Casos que SI requieren filtro territorial
  test("true para 'Diputados 2025'", () => {
    expect(requiereFiltroTerritorial("Diputados 2025")).toBe(true);
  });

  test("true para 'Alcaldes'", () => {
    expect(requiereFiltroTerritorial("Alcaldes")).toBe(true);
  });

  test("true para 'Concejales'", () => {
    expect(requiereFiltroTerritorial("Concejales")).toBe(true);
  });

  test("true para 'Senadores'", () => {
    expect(requiereFiltroTerritorial("Senadores")).toBe(true);
  });

  // Casos borde
  test("true cuando nombre es null (conservador)", () => {
    expect(requiereFiltroTerritorial(null)).toBe(true);
  });

  test("true cuando nombre es undefined (conservador)", () => {
    expect(requiereFiltroTerritorial(undefined)).toBe(true);
  });

  test("true cuando nombre es string vacio (conservador)", () => {
    expect(requiereFiltroTerritorial("")).toBe(true);
  });
});

  test("sin_empezar cuando total=0 (defensivo)", () => {
    expect(deriveEleccionEstado({ respondidas: 0, total: 0 })).toBe("sin_empezar");
    expect(deriveEleccionEstado({ respondidas: 5, total: 0 })).toBe("sin_empezar");
  });

  test("en_curso cuando 0 < respondidas < total", () => {
    expect(deriveEleccionEstado({ respondidas: 6, total: 12 })).toBe("en_curso");
    expect(deriveEleccionEstado({ respondidas: 1, total: 12 })).toBe("en_curso");
    expect(deriveEleccionEstado({ respondidas: 11, total: 12 })).toBe("en_curso");
  });

  test("completa cuando respondidas >= total", () => {
    expect(deriveEleccionEstado({ respondidas: 12, total: 12 })).toBe("completa");
    // Defensivo: tolera respondidas > total sin caer en "en_curso".
    expect(deriveEleccionEstado({ respondidas: 13, total: 12 })).toBe("completa");
  });

  test("tolera valores negativos como sin_empezar", () => {
    expect(deriveEleccionEstado({ respondidas: -1, total: 12 })).toBe("sin_empezar");
  });
});

describe("formatProgresoLabel", () => {
  test("formato normal", () => {
    expect(formatProgresoLabel(6, 12)).toBe("6 de 12 preguntas");
    expect(formatProgresoLabel(0, 12)).toBe("0 de 12 preguntas");
    expect(formatProgresoLabel(12, 12)).toBe("12 de 12 preguntas");
  });

  test("total=0 devuelve mensaje explicito, no '0 de 0'", () => {
    expect(formatProgresoLabel(0, 0)).toBe("Sin preguntas disponibles");
  });

  test("clamp cuando respondidas > total (drift)", () => {
    expect(formatProgresoLabel(15, 12)).toBe("12 de 12 preguntas");
  });

  test("clamp cuando respondidas es negativo", () => {
    expect(formatProgresoLabel(-3, 12)).toBe("0 de 12 preguntas");
  });
});

describe("computeProgresoRatio", () => {
  test("fraccion normal", () => {
    expect(computeProgresoRatio(6, 12)).toBe(0.5);
    expect(computeProgresoRatio(0, 12)).toBe(0);
    expect(computeProgresoRatio(12, 12)).toBe(1);
  });

  test("total=0 devuelve 0, no NaN", () => {
    expect(computeProgresoRatio(0, 0)).toBe(0);
    expect(computeProgresoRatio(5, 0)).toBe(0);
  });

  test("clamp a [0, 1]", () => {
    expect(computeProgresoRatio(15, 12)).toBe(1);
    expect(computeProgresoRatio(-3, 12)).toBe(0);
  });
});

describe("computeDiasRestantes", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  test("null cuando no hay fecha", () => {
    expect(computeDiasRestantes(null, now)).toBeNull();
    expect(computeDiasRestantes(undefined, now)).toBeNull();
    expect(computeDiasRestantes("", now)).toBeNull();
  });

  test("null cuando la fecha es invalida", () => {
    expect(computeDiasRestantes("no-una-fecha", now)).toBeNull();
  });

  test("dias futuros", () => {
    expect(computeDiasRestantes("2026-01-11", now)).toBe(10);
    expect(computeDiasRestantes("2026-02-12", now)).toBe(42);
  });

  test("hoy = 0", () => {
    expect(computeDiasRestantes("2026-01-01", now)).toBe(0);
  });

  test("eleccion ya paso -> negativo", () => {
    expect(computeDiasRestantes("2025-12-25", now)).toBe(-7);
  });
});

describe("formatDiasRestantesChip", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  test("dias futuros -> '42d'", () => {
    expect(formatDiasRestantesChip("2026-02-12", now)).toBe("42d");
  });

  test("hoy -> 'hoy'", () => {
    expect(formatDiasRestantesChip("2026-01-01", now)).toBe("hoy");
  });

  test("eleccion pasada -> 'cerrada'", () => {
    expect(formatDiasRestantesChip("2025-12-25", now)).toBe("cerrada");
  });

  test("sin fecha -> null", () => {
    expect(formatDiasRestantesChip(null, now)).toBeNull();
  });
});
