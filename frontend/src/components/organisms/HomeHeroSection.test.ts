/**
 * Tests de organisms/HomeHeroSection.tsx — funcion pura countdownLabel.
 *
 * countdownLabel(days) : string | null
 *
 * Reglas de negocio (countdown pill, DS-11 Pantalla 1):
 *   days < 0   -> null  (eleccion pasada, no mostrar pill)
 *   days === 0 -> "Elecciones hoy"
 *   days === 1 -> "Elecciones manana"
 *   days > 1   -> "Elecciones en {N} dias"
 */

import { countdownLabel } from "./HomeHeroSection";

describe("countdownLabel", () => {
  it("dias negativos -> null (eleccion ya paso)", () => {
    expect(countdownLabel(-1)).toBeNull();
    expect(countdownLabel(-30)).toBeNull();
  });

  it("0 dias -> 'Elecciones hoy'", () => {
    expect(countdownLabel(0)).toBe("Elecciones hoy");
  });

  it("1 dia -> 'Elecciones manana'", () => {
    expect(countdownLabel(1)).toBe("Elecciones manana");
  });

  it("2+ dias -> 'Elecciones en N dias'", () => {
    expect(countdownLabel(2)).toBe("Elecciones en 2 dias");
    expect(countdownLabel(30)).toBe("Elecciones en 30 dias");
    expect(countdownLabel(180)).toBe("Elecciones en 180 dias");
  });

  it("retorna siempre string o null — nunca undefined", () => {
    [-5, 0, 1, 7, 365].forEach((d) => {
      const r = countdownLabel(d);
      expect(r === null || typeof r === "string").toBe(true);
    });
  });
});
