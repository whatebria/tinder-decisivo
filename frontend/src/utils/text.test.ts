/**
 * Tests unitarios para utils/text.ts.
 *
 * Sin React, sin render, sin API. Solo input/output.
 */
import { normalizeForSearch, sanitizeSnippet } from "./text";

describe("normalizeForSearch", () => {
  test("convierte a minusculas", () => {
    expect(normalizeForSearch("GARCIA")).toBe("garcia");
  });

  test("elimina acentos agudos", () => {
    expect(normalizeForSearch("Ramírez")).toBe("ramirez");
    expect(normalizeForSearch("Bogotá")).toBe("bogota");
    expect(normalizeForSearch("Núñez")).toBe("nunez");
  });

  test("elimina enye", () => {
    expect(normalizeForSearch("Muñoz")).toBe("munoz");
    expect(normalizeForSearch("España")).toBe("espana");
  });

  test("combina minusculas y acentos", () => {
    expect(normalizeForSearch("ELECCIÓN")).toBe("eleccion");
    expect(normalizeForSearch("POLÍTICO")).toBe("politico");
  });

  test("tolera string vacio", () => {
    expect(normalizeForSearch("")).toBe("");
  });

  test("deja intactos strings sin acentos", () => {
    expect(normalizeForSearch("juan perez")).toBe("juan perez");
  });

  test("mantiene numeros y espacios", () => {
    expect(normalizeForSearch("Región 13")).toBe("region 13");
  });
});

describe("sanitizeSnippet", () => {
  test("elimina tags HTML basicos", () => {
    expect(sanitizeSnippet("<p>Hola</p>")).toBe("Hola");
  });

  test("reemplaza <br> por espacio", () => {
    expect(sanitizeSnippet("linea1<br>linea2")).toBe("linea1 linea2");
  });

  test("decodifica entidades basicas", () => {
    expect(sanitizeSnippet("Rock &amp; Roll")).toBe("Rock & Roll");
    expect(sanitizeSnippet("&lt;b&gt;")).toBe("<b>");
  });

  test("colapsa whitespace", () => {
    expect(sanitizeSnippet("   hola   mundo   ")).toBe("hola mundo");
  });

  test("undefined devuelve string vacio", () => {
    expect(sanitizeSnippet(undefined)).toBe("");
  });
});
