/**
 * Tests para domain/affinity.ts
 *
 * Verifica el mapping correcto de porcentajes a tiers de afinidad
 * y los colores resultantes (light y dark). Funciones puras, sin mocks.
 */

import { getAffinityColor, getAffinityTier } from "../../src/domain/affinity";

describe("getAffinityTier", () => {
  it("retorna tier 5 para 81-100%", () => {
    expect(getAffinityTier(81)).toBe(5);
    expect(getAffinityTier(87)).toBe(5);
    expect(getAffinityTier(100)).toBe(5);
  });

  it("retorna tier 4 para 61-80%", () => {
    expect(getAffinityTier(61)).toBe(4);
    expect(getAffinityTier(71)).toBe(4);
    expect(getAffinityTier(80)).toBe(4);
  });

  it("retorna tier 3 para 41-60%", () => {
    expect(getAffinityTier(41)).toBe(3);
    expect(getAffinityTier(52)).toBe(3);
    expect(getAffinityTier(60)).toBe(3);
  });

  it("retorna tier 2 para 21-40%", () => {
    expect(getAffinityTier(21)).toBe(2);
    expect(getAffinityTier(31)).toBe(2);
    expect(getAffinityTier(40)).toBe(2);
  });

  it("retorna tier 1 para 0-20%", () => {
    expect(getAffinityTier(0)).toBe(1);
    expect(getAffinityTier(10)).toBe(1);
    expect(getAffinityTier(20)).toBe(1);
  });

  it("clampea valores fuera de rango", () => {
    expect(getAffinityTier(-5)).toBe(1);   // negativo -> tier 1
    expect(getAffinityTier(120)).toBe(5);  // > 100 -> tier 5
  });
});

describe("getAffinityColor", () => {
  it("retorna colores light mode por defecto", () => {
    // Tier 5 (verde acento)
    expect(getAffinityColor(87)).toBe("#3A9E7A");
    // Tier 4 (verde bosque)
    expect(getAffinityColor(71)).toBe("#6B9B7A");
    // Tier 3 (mostaza)
    expect(getAffinityColor(52)).toBe("#C89B5C");
    // Tier 2 (terracota media)
    expect(getAffinityColor(31)).toBe("#D07777");
    // Tier 1 (terracota)
    expect(getAffinityColor(10)).toBe("#B85C5C");
  });

  it("retorna colores dark mode cuando isDark=true", () => {
    // Tier 5 dark (verde claro)
    expect(getAffinityColor(87, true)).toBe("#5BCEA0");
    // Tier 4 dark
    expect(getAffinityColor(71, true)).toBe("#8FB89A");
    // Tier 3 dark
    expect(getAffinityColor(52, true)).toBe("#D9B378");
  });

  it("no retorna hex invalido para ningun valor", () => {
    for (let pct = 0; pct <= 100; pct += 5) {
      const color = getAffinityColor(pct);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
