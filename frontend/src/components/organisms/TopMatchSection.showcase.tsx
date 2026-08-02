/**
 * Showcase de TopMatchSection.
 * Extraido de ResultadosScreen en REFACTOR-004.
 */

import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { TopMatchSection } from "./TopMatchSection";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo" | "dsReference"
>;

/** Datos minimos de MatchResult para el showcase (tipado local). */
const mockResult = {
  candidato_data: {
    id: 1,
    nombre: "María",
    apellido: "González",
    partido: "Partido Verde",
    profile_picture: null,
  },
  match_percentage: "87",
  confianza: "ALTA" as const,
  preguntas_consideradas: 12,
  breakdown_por_eje: {},
};

const mockResultTentative = {
  ...mockResult,
  match_percentage: "74",
  confianza: "TENTATIVA" as const,
  preguntas_consideradas: 4,
};

const mockChartData = {
  Economía: 0.9,
  "Medio Ambiente": 0.8,
  "Salud": 0.85,
  Educación: 0.7,
};

const showcase: ShowcaseEntry = {
  description:
    "Card del candidato #1 del ranking. Encapsula banner de resultado preliminar (cuando confianza = TENTATIVA), ResultadoHero y BookmarkActions. Extraido de ResultadosScreen (REFACTOR-004).",

  status: "stable",

  a11y: [
    "ResultadoHero expone accessibilityLabel con nombre completo + porcentaje.",
    "El banner TENTATIVA usa color c.warning: verificar contraste sobre fondo de card.",
    "BookmarkActions solo se renderiza para usuarios auth (isGuest=false).",
  ],

  doNotUse: [
    "No usar para candidatos del ranking secundario — usar RankingCard/RankingRow.",
    "No pasar result.candidato_data directamente sin haber derivado matchColor y chartData en el screen.",
  ],

  relatedTo: ["ResultadoHero", "BookmarkActions", "RankingCard", "RankingRow"],
  dsReference: "DS-12 Matching",

  variants: [
    {
      label: "confianza alta (auth)",
      surface: "card",
      render: () => (
        <TopMatchSection
          result={mockResult as any}
          matchColor="#22c55e"
          chartData={mockChartData}
          isFavorito={false}
          isGuest={false}
          onDetalle={() => {}}
          onToggleFav={() => {}}
          onToggleDesc={() => {}}
          loadingBookmarks={false}
        />
      ),
    },
    {
      label: "confianza TENTATIVA (banner activo)",
      surface: "card",
      render: () => (
        <TopMatchSection
          result={mockResultTentative as any}
          matchColor="#f59e0b"
          chartData={mockChartData}
          isFavorito={false}
          isGuest={false}
          onDetalle={() => {}}
          onToggleFav={() => {}}
          onToggleDesc={() => {}}
          loadingBookmarks={false}
        />
      ),
    },
    {
      label: "usuario guest (sin BookmarkActions)",
      surface: "card",
      render: () => (
        <TopMatchSection
          result={mockResult as any}
          matchColor="#22c55e"
          chartData={mockChartData}
          isFavorito={false}
          isGuest={true}
          onDetalle={() => {}}
          onToggleFav={() => {}}
          onToggleDesc={() => {}}
          loadingBookmarks={false}
        />
      ),
    },
    {
      label: "favorito marcado",
      surface: "card",
      render: () => (
        <TopMatchSection
          result={mockResult as any}
          matchColor="#22c55e"
          chartData={mockChartData}
          isFavorito={true}
          isGuest={false}
          onDetalle={() => {}}
          onToggleFav={() => {}}
          onToggleDesc={() => {}}
          loadingBookmarks={false}
        />
      ),
    },
  ],

  props: [
    { name: "result", type: "MatchResult", required: true, description: "Resultado del candidato #1. Incluye candidato_data, match_percentage, confianza, ptas_consideradas." },
    { name: "matchColor", type: "string", required: true, description: "Color hex del tier de afinidad. Derivar con getMatchColor(pct) en el screen." },
    { name: "chartData", type: "Record<string, number>", required: true, description: "Datos del radar. Derivar con breakdownToChartData(result.breakdown_por_eje) en el screen." },
    { name: "isFavorito", type: "boolean", required: true },
    { name: "isGuest", type: "boolean", required: true, description: "Oculta BookmarkActions cuando true." },
    { name: "onDetalle", type: "() => void", required: true, description: "Navegar al perfil completo del candidato." },
    { name: "onToggleFav", type: "(id: number) => void", required: true },
    { name: "onToggleDesc", type: "(id: number) => void", required: true },
    { name: "loadingBookmarks", type: "boolean", required: true, description: "Bloquea BookmarkActions mientras hay una mutacion en vuelo." },
  ],

  snippet: `import { TopMatchSection } from "@/components";
import { getMatchColor, breakdownToChartData } from "@/services/matching";

// En ResultadosScreen, una vez derivados los datos:
const topResult = sortedResults[0];
const matchColor = getMatchColor(Number(topResult.match_percentage));
const chartData = breakdownToChartData(topResult.breakdown_por_eje);

<TopMatchSection
  result={topResult}
  matchColor={matchColor}
  chartData={chartData}
  isFavorito={favoritos.has(topResult.candidato_data.id)}
  isGuest={isGuest}
  onDetalle={() => navigation.push("DetalleCandidato", { id: topResult.candidato_data.id })}
  onToggleFav={handleToggleFav}
  onToggleDesc={handleToggleDesc}
  loadingBookmarks={loadingBookmarks}
/>`,
};

export default showcase;
