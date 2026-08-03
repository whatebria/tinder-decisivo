import { buildShareText, fromMatchResults, type ShareableMatch } from "./share";
import type { MatchResult } from "../api/endpoints";

// Helper para armar mocks sinteticos rapido.
function m(
  nombre: string,
  apellido: string,
  partido: string | null,
  pct: number
): ShareableMatch {
  return {
    match_percentage: String(pct),
    candidato_data: { nombre, apellido, partido },
  };
}

describe("buildShareText", () => {
  it("incluye el nombre del tipo de eleccion en el header", () => {
    const text = buildShareText({
      tipoNombre: "Presidencial 2025",
      matches: [m("Ana", "Perez", "Partido A", 75)],
    });
    expect(text).toContain("Presidencial 2025");
    expect(text.startsWith("Mis matches en VotoAFin")).toBe(true);
  });

  it("ordena por porcentaje descendente", () => {
    const text = buildShareText({
      tipoNombre: "Test",
      matches: [
        m("Baja", "Persona", null, 30),
        m("Alta", "Persona", null, 90),
        m("Media", "Persona", null, 60),
      ],
    });
    const linea1 = text.split("\n").find((l) => l.startsWith("1."));
    const linea2 = text.split("\n").find((l) => l.startsWith("2."));
    const linea3 = text.split("\n").find((l) => l.startsWith("3."));
    expect(linea1).toContain("Alta");
    expect(linea2).toContain("Media");
    expect(linea3).toContain("Baja");
  });

  it("limita a los primeros 5 matches", () => {
    const matches = Array.from({ length: 8 }, (_, i) =>
      m(`Cand${i + 1}`, "X", null, 100 - i)
    );
    const text = buildShareText({ tipoNombre: "Test", matches });
    const lineas = text.split("\n").filter((l) => /^\d+\./.test(l));
    expect(lineas).toHaveLength(5);
  });

  it("muestra partido entre parentesis si existe", () => {
    const text = buildShareText({
      tipoNombre: "Test",
      matches: [m("Ana", "Perez", "Partido A", 75)],
    });
    expect(text).toContain("Ana Perez (Partido A)");
  });

  it("omite parentesis de partido si es vacio", () => {
    const text = buildShareText({
      tipoNombre: "Test",
      matches: [m("Ana", "Perez", null, 75)],
    });
    // "Ana Perez -" sin parentesis
    expect(text).toContain("Ana Perez - 75%");
    expect(text).not.toContain("()");
  });

  it("redondea el porcentaje a entero", () => {
    const text = buildShareText({
      tipoNombre: "Test",
      matches: [m("Ana", "Perez", null, 75.7)],
    });
    expect(text).toContain("76%");
  });

  it("incluye la URL de la app al final", () => {
    const text = buildShareText({
      tipoNombre: "Test",
      matches: [m("Ana", "Perez", null, 75)],
    });
    expect(text).toContain("https://tinder-decisivo.cl");
  });

  it("maneja lista vacia sin explotar", () => {
    const text = buildShareText({ tipoNombre: "Test", matches: [] });
    expect(text).toContain("Sin matches todavia");
    expect(text).toContain("https://tinder-decisivo.cl");
  });
});

// -- fromMatchResults (TASK-012) ---------------------------------------------

const mkMatchResult = (
  nombre: string,
  apellido: string,
  partido: string | null,
  pct: string
): MatchResult =>
  ({
    match_percentage: pct,
    candidato_data: { nombre, apellido, partido },
  }) as unknown as MatchResult;

describe("fromMatchResults", () => {
  it("mapea match_percentage correctamente", () => {
    const result = fromMatchResults([mkMatchResult("Ana", "Perez", "Partido A", "87")]);
    expect(result[0].match_percentage).toBe("87");
  });

  it("mapea nombre y apellido", () => {
    const result = fromMatchResults([mkMatchResult("Ana", "Perez", "Partido A", "87")]);
    expect(result[0].candidato_data.nombre).toBe("Ana");
    expect(result[0].candidato_data.apellido).toBe("Perez");
  });

  it("preserva partido no-null", () => {
    const result = fromMatchResults([mkMatchResult("Ana", "Perez", "Partido A", "87")]);
    expect(result[0].candidato_data.partido).toBe("Partido A");
  });

  it("partido null se normaliza a null", () => {
    const result = fromMatchResults([mkMatchResult("Ana", "Perez", null, "87")]);
    expect(result[0].candidato_data.partido).toBeNull();
  });

  it("lista vacia devuelve lista vacia", () => {
    expect(fromMatchResults([])).toEqual([]);
  });

  it("mantiene el orden de entrada", () => {
    const result = fromMatchResults([
      mkMatchResult("Ana", "P", null, "90"),
      mkMatchResult("Bea", "L", null, "70"),
    ]);
    expect(result[0].candidato_data.nombre).toBe("Ana");
    expect(result[1].candidato_data.nombre).toBe("Bea");
  });
});
