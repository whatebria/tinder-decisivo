import { buildShareText, type ShareableMatch } from "./share";

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
    expect(text.startsWith("Mis matches en Tinder Decisivo")).toBe(true);
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
