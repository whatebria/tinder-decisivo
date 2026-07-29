/**
 * Tests del helper puro deriveIniciales del MatchSummaryCard.
 *
 * El resto del componente es composicion de atoms (Avatar/Chip/Button) que ya
 * tienen su propia validacion visual en el design system catalog — no se
 * duplica testing de rendering aca (patron del repo: domain-first).
 */

import { deriveIniciales } from "./MatchSummaryCard";

describe("deriveIniciales", () => {
  test("nombre + apellido -> primera de cada uno", () => {
    expect(deriveIniciales("Ada Perez")).toBe("AP");
    expect(deriveIniciales("Gabriel Boric")).toBe("GB");
  });

  test("nombre compuesto usa primero y ultimo", () => {
    expect(deriveIniciales("Maria Jose Perez Gonzalez")).toBe("MG");
  });

  test("un solo nombre -> primeras 2 letras", () => {
    expect(deriveIniciales("Madonna")).toBe("MA");
    expect(deriveIniciales("Ea")).toBe("EA");
  });

  test("string vacio o solo espacios -> '?'", () => {
    expect(deriveIniciales("")).toBe("?");
    expect(deriveIniciales("   ")).toBe("?");
  });

  test("tolerante a espacios extra", () => {
    expect(deriveIniciales("  Ada   Perez  ")).toBe("AP");
    expect(deriveIniciales("Ada\tPerez")).toBe("AP");
  });

  test("mayusculas siempre", () => {
    expect(deriveIniciales("ada perez")).toBe("AP");
    expect(deriveIniciales("aDA pErEz")).toBe("AP");
  });
});
