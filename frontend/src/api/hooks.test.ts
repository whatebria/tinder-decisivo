/**
 * @jest-environment jsdom
 *
 * Tests de los hooks de React Query que rodean el flujo de matching.
 *
 * Foco: regresion del bug donde HomeScreen se quedaba viendo una eleccion
 * como "no completada" despues de haber submitteado el cuestionario. La
 * causa era que el mutation `useMatchCandidatos` (POST /match-candidatos/)
 * no seedeaba el cache del query `useMatchesQuery` que HomeScreen consume.
 *
 * Estos tests bloquean la regresion asegurando:
 *   1. onSuccess del mutation escribe en queryKeys.matches(tipoId).
 *   2. Un `useMatchesQuery(tipoId)` que se monta despues, lee ese cache
 *      SIN disparar un refetch.
 *   3. El guard de isAuth en useMatchesQuery sigue firme (bug previo).
 *   4. La invalidacion transversal de useUpdateRespuesta sigue tumbando
 *      todos los matches (evita cache pegajoso al editar respuestas).
 *
 * NO testeamos la logica del endpoint (eso es backend). Mockeamos
 * `../api/endpoints` para controlar respuestas.
 */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";

import {
  useMatchCandidatos,
  useMatchesQuery,
  useUpdateRespuesta,
} from "./hooks";
import { queryKeys } from "./queryClient";
import { useAuthStore } from "../store/auth";
import type { MatchResult, EditarRespuestaResponse } from "./endpoints";

// -- Mocks -----------------------------------------------------------------

jest.mock("./endpoints", () => {
  const actual = jest.requireActual("./endpoints");
  return {
    ...actual,
    matchCandidatos: jest.fn(),
    updateRespuesta: jest.fn(),
  };
});

const {
  matchCandidatos: matchCandidatosMock,
  updateRespuesta: updateRespuestaMock,
} = jest.requireMock("./endpoints") as {
  matchCandidatos: jest.Mock;
  updateRespuesta: jest.Mock;
};

// -- Helpers ---------------------------------------------------------------

function makeMatch(overrides: Partial<MatchResult> = {}): MatchResult {
  // Solo llenamos los campos que los tests observan (id, candidato_data.id).
  // Cast a MatchResult porque el shape completo del Candidato es enorme y
  // no aporta al test — hoy los tests miran length y id, no propiedades
  // del candidato mas alla del id.
  return {
    id: 1,
    user: "user@test.local",
    candidato_data: { id: 1, nombre: "Candidato Uno" },
    match_percentage: "87.00",
    preguntas_consideradas: 20,
    confianza: "alta",
    confianza_display: "Alta",
    ...overrides,
  } as unknown as MatchResult;
}

/**
 * Crea un QueryClient fresh por test (evita contaminacion cruzada) y un
 * wrapper para renderHook con el Provider correspondiente.
 */
function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: 0, staleTime: 60_000, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { qc, Wrapper };
}

// -- Reset entre tests -----------------------------------------------------

beforeEach(() => {
  matchCandidatosMock.mockReset();
  updateRespuestaMock.mockReset();
  useAuthStore.setState({
    token: null,
    userId: null,
    isGuest: false,
    isAuthenticated: false,
    isHydrated: true,
  });
});

// -- useMatchCandidatos ----------------------------------------------------

describe("useMatchCandidatos (mutation)", () => {
  test("onSuccess seedea el cache de useMatchesQuery para ese tipoId (fix bug)", async () => {
    const data = [makeMatch({ id: 1 }), makeMatch({ id: 2 })];
    matchCandidatosMock.mockResolvedValueOnce(data);

    const { qc, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchCandidatos(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync(42);
    });

    // El cache del query DEBE quedar poblado con la data del mutation.
    expect(qc.getQueryData(queryKeys.matches(42))).toEqual(data);
  });

  test("un tipoId distinto NO contamina el cache de otros tipos", async () => {
    matchCandidatosMock.mockResolvedValueOnce([makeMatch({ id: 99 })]);

    const { qc, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchCandidatos(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync(7);
    });

    expect(qc.getQueryData(queryKeys.matches(7))).toBeDefined();
    // Otro tipo debe seguir sin data.
    expect(qc.getQueryData(queryKeys.matches(8))).toBeUndefined();
    expect(qc.getQueryData(queryKeys.matches(null))).toBeUndefined();
  });

  test("no toca el cache si el mutation falla", async () => {
    matchCandidatosMock.mockRejectedValueOnce(new Error("500 backend"));

    const { qc, Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchCandidatos(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync(3).catch(() => undefined);
    });

    expect(qc.getQueryData(queryKeys.matches(3))).toBeUndefined();
  });
});

// -- Integracion mutation -> query ----------------------------------------

describe("integracion mutation -> query (bug HomeScreen)", () => {
  test("query montado DESPUES del mutation lee el cache sin refetchear", async () => {
    const data = [makeMatch({ id: 11 })];
    matchCandidatosMock.mockResolvedValueOnce(data);
    useAuthStore.setState({ isAuthenticated: true });

    const { Wrapper } = makeWrapper();

    // Simula: user hace submit -> mutation corre y seedea cache.
    const { result: mut } = renderHook(() => useMatchCandidatos(), {
      wrapper: Wrapper,
    });
    await act(async () => {
      await mut.current.mutateAsync(5);
    });

    // Simula: user vuelve a HomeScreen -> monta el query.
    const { result: q } = renderHook(() => useMatchesQuery(5), {
      wrapper: Wrapper,
    });

    // El query debe leer del cache instantaneamente, sin llamar de nuevo
    // al endpoint (staleTime es 60s en test).
    await waitFor(() => {
      expect(q.current.data).toEqual(data);
    });
    expect(matchCandidatosMock).toHaveBeenCalledTimes(1);
  });

  test("HomeScreen (derivacion isCompleted) queda en `true` despues del submit", async () => {
    // Reproduce el bug: sin el fix, matches.length seria 0 hasta el proximo
    // refetch. Con el fix, es > 0 al toque.
    matchCandidatosMock.mockResolvedValueOnce([makeMatch()]);
    useAuthStore.setState({ isAuthenticated: true });

    const { Wrapper } = makeWrapper();
    const { result: mut } = renderHook(() => useMatchCandidatos(), {
      wrapper: Wrapper,
    });
    await act(async () => {
      await mut.current.mutateAsync(1);
    });

    const { result: q } = renderHook(() => useMatchesQuery(1), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(q.current.data).toBeDefined());

    const matches = q.current.data ?? [];
    const isCompleted = matches.length > 0; // <-- exactamente la derivacion de HomeScreen
    expect(isCompleted).toBe(true);
  });
});

// -- useMatchesQuery -------------------------------------------------------

describe("useMatchesQuery (guards)", () => {
  test("NO dispara si el usuario no esta autenticado (evita 401)", async () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchesQuery(1), { wrapper: Wrapper });

    // Damos tiempo por si dispara mal.
    await new Promise((r) => setTimeout(r, 20));
    expect(matchCandidatosMock).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  test("NO dispara si tipoEleccionId es null", async () => {
    useAuthStore.setState({ isAuthenticated: true });

    const { Wrapper } = makeWrapper();
    renderHook(() => useMatchesQuery(null), { wrapper: Wrapper });

    await new Promise((r) => setTimeout(r, 20));
    expect(matchCandidatosMock).not.toHaveBeenCalled();
  });

  test("retorna [] sin lanzar error cuando el backend responde 400 (sin respuestas aun)", async () => {
    // BUG-010: 400 es un estado valido — el user no hizo el cuestionario aun.
    // El hook debe silenciarlo y retornar lista vacia en vez de error.
    useAuthStore.setState({ isAuthenticated: true });
    const axiosError = Object.assign(new Error("Bad Request"), {
      isAxiosError: true,
      response: { status: 400, data: { detail: "Sin respuestas" } },
    });
    matchCandidatosMock.mockRejectedValueOnce(axiosError);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchesQuery(99), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  test("dispara y trae data si isAuth=true + tipoId valido", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const data = [makeMatch()];
    matchCandidatosMock.mockResolvedValueOnce(data);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMatchesQuery(1), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.data).toEqual(data));
    expect(matchCandidatosMock).toHaveBeenCalledWith(1);
  });
});

// -- useUpdateRespuesta (invalidacion defensiva) ---------------------------

describe("useUpdateRespuesta invalida matches y misRespuestas", () => {
  test("onSuccess invalida el prefix matchesAll (todas las elecciones)", async () => {
    const resp: EditarRespuestaResponse = {
      detail: "ok",
      match_stale: true,
    } as unknown as EditarRespuestaResponse;
    updateRespuestaMock.mockResolvedValueOnce(resp);

    const { qc, Wrapper } = makeWrapper();

    // Pre-populamos el cache para verificar la invalidacion.
    qc.setQueryData(queryKeys.matches(1), [makeMatch()]);
    qc.setQueryData(queryKeys.matches(2), [makeMatch()]);
    qc.setQueryData(queryKeys.misRespuestas(1), []);

    const spy = jest.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useUpdateRespuesta(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        respuestaId: 10,
        opcionId: 20,
        peso: 3,
      });
    });

    // Deben haberse llamado 2 invalidaciones: misRespuestasAll + matchesAll.
    const calls = spy.mock.calls.map((c) => c[0]?.queryKey);
    expect(calls).toContainEqual(queryKeys.misRespuestasAll);
    expect(calls).toContainEqual(queryKeys.matchesAll);
  });
});
