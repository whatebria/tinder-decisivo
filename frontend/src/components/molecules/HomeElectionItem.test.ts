/**
 * Tests de molecules/HomeElectionItem.tsx — funcion pura ctaForEstado.
 *
 * ctaForEstado(estado, props) : { label, onPress?, variant }
 *
 * Reglas de negocio (DS-11 Pantalla 1):
 *   sin_empezar -> label "Empezar"        | variant "secondary"
 *   en_curso    -> label "Continuar"      | variant "primary"
 *   completa    -> label "Ver resultados" | variant "ghost"
 */

import { ctaForEstado } from "./HomeElectionItem";

const mockEmpezar = jest.fn();
const mockContinuar = jest.fn();
const mockResultados = jest.fn();

const allCallbacks = {
  onEmpezar: mockEmpezar,
  onContinuar: mockContinuar,
  onVerResultados: mockResultados,
};

describe("ctaForEstado", () => {
  it("sin_empezar -> Empezar, secondary, usa onEmpezar", () => {
    const r = ctaForEstado("sin_empezar", allCallbacks);
    expect(r.label).toBe("Empezar");
    expect(r.variant).toBe("secondary");
    expect(r.onPress).toBe(mockEmpezar);
  });

  it("en_curso -> Continuar, primary, usa onContinuar", () => {
    const r = ctaForEstado("en_curso", allCallbacks);
    expect(r.label).toBe("Continuar");
    expect(r.variant).toBe("primary");
    expect(r.onPress).toBe(mockContinuar);
  });

  it("completa -> Ver resultados, ghost, usa onVerResultados", () => {
    const r = ctaForEstado("completa", allCallbacks);
    expect(r.label).toBe("Ver resultados");
    expect(r.variant).toBe("ghost");
    expect(r.onPress).toBe(mockResultados);
  });

  it("onPress puede ser undefined si el callback no se paso", () => {
    const r = ctaForEstado("sin_empezar", {
      onEmpezar: undefined,
      onContinuar: undefined,
      onVerResultados: undefined,
    });
    expect(r.label).toBe("Empezar");
    expect(r.onPress).toBeUndefined();
  });

  it("variant siempre es uno de los valores validos del DS", () => {
    const validVariants = ["primary", "secondary", "ghost"] as const;
    const estados = ["sin_empezar", "en_curso", "completa"] as const;
    for (const estado of estados) {
      const { variant } = ctaForEstado(estado, allCallbacks);
      expect(validVariants).toContain(variant);
    }
  });
});
