import {
  calcularResumen,
  compararPosturas,
  type ItemComparacion,
} from "./comparar";
import type { PosturaCandidatoDetalle } from "../api/endpoints";

function p(
  preguntaId: number,
  valor: number,
  eje = "economia",
  orden = preguntaId
): PosturaCandidatoDetalle {
  return {
    id: preguntaId * 100,
    candidato: 0,
    pregunta: preguntaId,
    opcion_respuesta: valor,
    justificacion: null,
    opcion_respuesta_texto: `Opcion ${valor}`,
    opcion_respuesta_valor: valor,
    candidato_nombre_completo: "",
    pregunta_texto: `Pregunta ${preguntaId}`,
    pregunta_orden: orden,
    eje_tematico: eje,
    eje_tematico_display: eje.charAt(0).toUpperCase() + eje.slice(1),
  };
}

function flat(grupos: ReturnType<typeof compararPosturas>): ItemComparacion[] {
  return grupos.flatMap((g) => g.items);
}

describe("compararPosturas", () => {
  it("cuando ambos responden igual: nivel identica y coinciden true", () => {
    const items = flat(compararPosturas([p(1, 5)], [p(1, 5)]));
    expect(items).toHaveLength(1);
    expect(items[0].nivel).toBe("identica");
    expect(items[0].coinciden).toBe(true);
  });

  it("diferencia de 1: nivel cercana", () => {
    const items = flat(compararPosturas([p(1, 5)], [p(1, 4)]));
    expect(items[0].nivel).toBe("cercana");
    expect(items[0].coinciden).toBe(false);
  });

  it("diferencia >= 3: nivel opuesta", () => {
    const items = flat(compararPosturas([p(1, 5)], [p(1, 1)]));
    expect(items[0].nivel).toBe("opuesta");
  });

  it("solo uno respondio: nivel solo_uno", () => {
    const items = flat(compararPosturas([p(1, 5)], []));
    expect(items[0].nivel).toBe("solo_uno");
    expect(items[0].posturaA).not.toBeNull();
    expect(items[0].posturaB).toBeNull();
  });

  it("agrupa por eje tematico", () => {
    const grupos = compararPosturas(
      [p(1, 5, "economia"), p(2, 3, "seguridad")],
      [p(1, 4, "economia"), p(2, 2, "seguridad")]
    );
    expect(grupos).toHaveLength(2);
    const ejes = grupos.map((g) => g.eje).sort();
    expect(ejes).toEqual(["economia", "seguridad"]);
  });

  it("ordena items dentro del grupo por pregunta_orden", () => {
    const grupos = compararPosturas(
      [p(3, 5, "e", 3), p(1, 4, "e", 1), p(2, 3, "e", 2)],
      [p(3, 5, "e", 3), p(1, 4, "e", 1), p(2, 3, "e", 2)]
    );
    const items = grupos[0].items;
    expect(items.map((i) => i.preguntaOrden)).toEqual([1, 2, 3]);
  });

  it("union de preguntas: incluye las que solo tiene A o solo B", () => {
    const grupos = compararPosturas([p(1, 5), p(2, 3)], [p(2, 3), p(3, 4)]);
    const items = flat(grupos);
    expect(items).toHaveLength(3);
    const ids = items.map((i) => i.preguntaId).sort();
    expect(ids).toEqual([1, 2, 3]);
  });

  it("input vacio devuelve array vacio", () => {
    expect(compararPosturas([], [])).toEqual([]);
  });
});

describe("calcularResumen", () => {
  it("cuenta correctamente cada nivel", () => {
    const grupos = compararPosturas(
      [p(1, 5), p(2, 5), p(3, 5), p(4, 5)],
      [p(1, 5), p(2, 4), p(3, 1), p(4, 5)]
    );
    const res = calcularResumen(grupos);
    expect(res.total).toBe(4);
    expect(res.identicas).toBe(2); // p1 y p4
    expect(res.cercanas).toBe(1); // p2 (diff 1)
    expect(res.opuestas).toBe(1); // p3 (diff 4)
  });

  it("porcentaje de coincidencia = (identica + cercana) / ambos_respondieron", () => {
    // 2 identicas + 1 cercana + 1 opuesta = 4 respondidos por ambos
    // (2+1)/4 = 75%
    const grupos = compararPosturas(
      [p(1, 5), p(2, 5), p(3, 5), p(4, 5)],
      [p(1, 5), p(2, 4), p(3, 1), p(4, 5)]
    );
    const res = calcularResumen(grupos);
    expect(res.porcentajeCoincidencia).toBe(75);
  });

  it("excluye del calculo las preguntas donde solo uno respondio", () => {
    // 1 identica + 1 solo_uno = 1 comparable, 100%
    const grupos = compararPosturas([p(1, 5), p(2, 3)], [p(1, 5)]);
    const res = calcularResumen(grupos);
    expect(res.identicas).toBe(1);
    expect(res.soloUno).toBe(1);
    expect(res.porcentajeCoincidencia).toBe(100);
  });

  it("0 comparables devuelve 0% (no NaN)", () => {
    const grupos = compararPosturas([p(1, 5)], []);
    const res = calcularResumen(grupos);
    expect(res.porcentajeCoincidencia).toBe(0);
  });
});
