/**
 * Tests unitarios puros para services/cuestionario.ts.
 *
 * Testea la logica de pesos, separacion de opciones, progreso,
 * navegacion y validacion. Todo con inputs/outputs planos.
 */
import {
  DEFAULT_PESO,
  PESOS,
  calcularProgreso,
  debeMostrarPeso,
  esPrimeraPregunta,
  esUltimaPregunta,
  puedeEnviar,
  separarOpciones,
  type RespuestaMinima,
} from "./cuestionario";

// -- Helpers de test ---------------------------------------------------------
const mkOpcion = (id: number, texto: string, esNoSe = false) =>
  ({
    id,
    texto,
    valor: id,
    es_no_se: esNoSe,
  }) as any;

const mkPregunta = (id: number) =>
  ({
    id,
    texto: `Pregunta ${id}`,
    orden: id,
  }) as any;

// -- PESOS -------------------------------------------------------------------
describe("PESOS", () => {
  test("hay exactamente 4 pesos", () => {
    expect(PESOS).toHaveLength(4);
  });

  test("valores van de 0 a 3 en orden", () => {
    expect(PESOS.map((p) => p.value)).toEqual([0, 1, 2, 3]);
  });

  test("todos tienen label no vacio", () => {
    PESOS.forEach((p) => {
      expect(p.label).toBeTruthy();
      expect(typeof p.label).toBe("string");
    });
  });

  test("DEFAULT_PESO es un valor valido de PESOS", () => {
    const valores = PESOS.map((p) => p.value);
    expect(valores).toContain(DEFAULT_PESO);
  });

  test("DEFAULT_PESO es medio (2), no extremo", () => {
    expect(DEFAULT_PESO).toBe(2);
  });
});

// -- separarOpciones ---------------------------------------------------------
describe("separarOpciones", () => {
  test("separa regulares vs no_se", () => {
    const opciones = [
      mkOpcion(1, "Muy de acuerdo"),
      mkOpcion(2, "Neutral"),
      mkOpcion(3, "No sé", true),
    ];
    const { regulares, noSe } = separarOpciones(opciones);
    expect(regulares).toHaveLength(2);
    expect(noSe?.id).toBe(3);
  });

  test("sin opcion 'no sé', noSe es undefined", () => {
    const opciones = [mkOpcion(1, "Si"), mkOpcion(2, "No")];
    const { regulares, noSe } = separarOpciones(opciones);
    expect(regulares).toHaveLength(2);
    expect(noSe).toBeUndefined();
  });

  test("input undefined devuelve regulares vacio y noSe undefined", () => {
    const { regulares, noSe } = separarOpciones(undefined);
    expect(regulares).toEqual([]);
    expect(noSe).toBeUndefined();
  });

  test("input vacio devuelve regulares vacio y noSe undefined", () => {
    const { regulares, noSe } = separarOpciones([]);
    expect(regulares).toEqual([]);
    expect(noSe).toBeUndefined();
  });

  test("solo hay 'no sé' -> regulares vacio, noSe presente", () => {
    const opciones = [mkOpcion(1, "No sé", true)];
    const { regulares, noSe } = separarOpciones(opciones);
    expect(regulares).toEqual([]);
    expect(noSe?.id).toBe(1);
  });
});

// -- debeMostrarPeso ---------------------------------------------------------
describe("debeMostrarPeso", () => {
  const opciones = [
    mkOpcion(1, "Muy de acuerdo"),
    mkOpcion(2, "Neutral"),
    mkOpcion(3, "No sé", true),
  ];

  test("opcion regular elegida -> true", () => {
    expect(debeMostrarPeso(opciones, 1)).toBe(true);
    expect(debeMostrarPeso(opciones, 2)).toBe(true);
  });

  test("opcion 'no sé' elegida -> false", () => {
    expect(debeMostrarPeso(opciones, 3)).toBe(false);
  });

  test("sin opcion elegida -> false", () => {
    expect(debeMostrarPeso(opciones, undefined)).toBe(false);
  });

  test("opcion inexistente -> false", () => {
    expect(debeMostrarPeso(opciones, 999)).toBe(false);
  });

  test("opciones undefined -> false", () => {
    expect(debeMostrarPeso(undefined, 1)).toBe(false);
  });
});

// -- calcularProgreso --------------------------------------------------------
describe("calcularProgreso", () => {
  test("primer pregunta (index=0) de 10 -> 10%", () => {
    expect(calcularProgreso(0, 10)).toBe(10);
  });

  test("ultima pregunta de 10 -> 100%", () => {
    expect(calcularProgreso(9, 10)).toBe(100);
  });

  test("pregunta 6 de 12 -> 50%", () => {
    expect(calcularProgreso(5, 12)).toBeCloseTo(50);
  });

  test("total 0 devuelve 0 (defensivo, no crashea)", () => {
    expect(calcularProgreso(0, 0)).toBe(0);
  });

  test("total negativo devuelve 0", () => {
    expect(calcularProgreso(0, -5)).toBe(0);
  });
});

// -- esUltimaPregunta / esPrimeraPregunta ------------------------------------
describe("navegacion", () => {
  describe("esUltimaPregunta", () => {
    test("index=9 de 10 total -> true", () => {
      expect(esUltimaPregunta(9, 10)).toBe(true);
    });

    test("index=5 de 10 -> false", () => {
      expect(esUltimaPregunta(5, 10)).toBe(false);
    });

    test("index=0 de 1 total -> true (unica pregunta es la ultima)", () => {
      expect(esUltimaPregunta(0, 1)).toBe(true);
    });
  });

  describe("esPrimeraPregunta", () => {
    test("index=0 -> true", () => {
      expect(esPrimeraPregunta(0)).toBe(true);
    });

    test("index=5 -> false", () => {
      expect(esPrimeraPregunta(5)).toBe(false);
    });

    test("index negativo (defensivo) -> true", () => {
      expect(esPrimeraPregunta(-1)).toBe(true);
    });
  });
});

// -- puedeEnviar -------------------------------------------------------------
describe("puedeEnviar", () => {
  const preguntas = [mkPregunta(1), mkPregunta(2), mkPregunta(3)];

  const mkResp = (opcionId: number): RespuestaMinima => ({
    opcionElegidaId: opcionId,
    peso: 2,
  });

  test("todas respondidas -> true", () => {
    const respuestas = {
      1: mkResp(10),
      2: mkResp(20),
      3: mkResp(30),
    };
    expect(puedeEnviar(preguntas, respuestas)).toBe(true);
  });

  test("falta una respuesta -> false", () => {
    const respuestas = {
      1: mkResp(10),
      2: mkResp(20),
      // 3 falta
    };
    expect(puedeEnviar(preguntas, respuestas)).toBe(false);
  });

  test("respuesta undefined explicito -> false", () => {
    const respuestas = {
      1: mkResp(10),
      2: mkResp(20),
      3: undefined,
    };
    expect(puedeEnviar(preguntas, respuestas)).toBe(false);
  });

  test("sin preguntas -> false (no permite submit sin nada)", () => {
    expect(puedeEnviar([], {})).toBe(false);
  });

  test("una sola pregunta respondida -> true", () => {
    const respuestas = { 1: mkResp(10) };
    expect(puedeEnviar([mkPregunta(1)], respuestas)).toBe(true);
  });
});
