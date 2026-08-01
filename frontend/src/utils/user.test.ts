/**
 * Tests de src/utils/user.ts
 *
 * Funciones puras de presentacion derivadas del perfil. Sin mocks.
 */

import {
  deriveDisplayName,
  deriveInitials,
  greetingForHour,
} from "./user";

describe("deriveInitials", () => {
  it("dos segmentos -> iniciales mayusculas de ambos", () => {
    expect(deriveInitials("jenny.venegas")).toBe("JV");
    expect(deriveInitials("juan.perez")).toBe("JP");
  });

  it("tres+ segmentos -> solo las dos primeras iniciales", () => {
    expect(deriveInitials("jenny.venegas.garcia")).toBe("JV");
  });

  it("un solo segmento -> solo la primera letra", () => {
    expect(deriveInitials("jenny")).toBe("J");
    expect(deriveInitials("a")).toBe("A");
  });

  it("segmento vacio -> ?", () => {
    expect(deriveInitials("")).toBe("?");
  });

  it("puntos consecutivos (segmentos vacios se filtran)", () => {
    expect(deriveInitials("jenny..venegas")).toBe("JV");
  });
});

describe("deriveDisplayName", () => {
  it("retorna el primer segmento del email prefix", () => {
    expect(deriveDisplayName("jenny.venegas")).toBe("jenny");
    expect(deriveDisplayName("jenny")).toBe("jenny");
  });

  it("tres segmentos -> solo el primero", () => {
    expect(deriveDisplayName("juan.carlos.lopez")).toBe("juan");
  });

  it("string vacio -> string vacio", () => {
    expect(deriveDisplayName("")).toBe("");
  });
});

describe("greetingForHour", () => {
  it("0-11 -> Buenos dias", () => {
    expect(greetingForHour(0)).toBe("Buenos dias");
    expect(greetingForHour(7)).toBe("Buenos dias");
    expect(greetingForHour(11)).toBe("Buenos dias");
  });

  it("12-19 -> Buenas tardes", () => {
    expect(greetingForHour(12)).toBe("Buenas tardes");
    expect(greetingForHour(15)).toBe("Buenas tardes");
    expect(greetingForHour(19)).toBe("Buenas tardes");
  });

  it("20-23 -> Buenas noches", () => {
    expect(greetingForHour(20)).toBe("Buenas noches");
    expect(greetingForHour(23)).toBe("Buenas noches");
  });

  it("sin argumento -> retorna un string no vacio (hora del sistema)", () => {
    const result = greetingForHour();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
