/**
 * Catalogo de organismos: relacionados a candidatos.
 *
 * Incluye: CandidateCard, ProfileHero, ResultadoHero, RankingRow, Comparator,
 * MatchExplanation, CandidatoPosturas.
 */

import React from "react";
import { View } from "react-native";

import {
  CandidateCard,
  Comparator,
  ProfileHero,
  RadarChart,
  RankingRow,
  ResultadoHero,
} from "../../../../components";
import { DemoText } from "../../showcase/DemoText";
import type { CatalogEntry } from "../../showcase/types";

const ejeScoresMock = {
  Educacion: 82,
  Salud: 75,
  Economia: 60,
  Seguridad: 45,
  "Medio ambiente": 88,
  Cultural: 70,
};

export const candidateOrgCatalog: CatalogEntry[] = [
  {
    name: "CandidateCard",
    path: "organisms/CandidateCard",
    category: "organisms",
    description: "Fila de resultado. Avatar + info (nombre, partido, MatchTier) + % grande + chevron para detalle.",
    variants: [
      {
        label: "high match, pressable",
        render: () => (
          <CandidateCard
            name="Gabriel Boric"
            partido="Frente Amplio"
            initials="GB"
            matchPercent={87}
            onPress={() => {}}
          />
        ),
      },
      {
        label: "mid match, sin press",
        render: () => (
          <CandidateCard
            name="Michelle Bachelet"
            partido="Partido Socialista"
            initials="MB"
            matchPercent={55}
          />
        ),
      },
      {
        label: "low match con color custom",
        render: () => (
          <CandidateCard
            name="Jose Antonio Kast"
            partido="Republicanos"
            initials="JK"
            matchPercent={28}
            avatarColor="#FDECEC"
            onPress={() => {}}
          />
        ),
      },
      {
        label: "sin match (vista exploratoria)",
        render: () => (
          <CandidateCard
            name="Yasna Provoste"
            partido="Democracia Cristiana"
            initials="YP"
            matchPercent={null}
            sublabel="Presidencial"
            onPress={() => {}}
          />
        ),
      },
    ],
    props: [
      { name: "name", type: "string", required: true },
      { name: "partido", type: "string", required: true },
      { name: "initials", type: "string", required: true },
      { name: "matchPercent", type: "number | null", required: true, description: "0-100 o null para ocultar % y MatchTier (vista exploratoria)." },
      { name: "sublabel", type: "string", description: "Texto extra bajo el partido (ej. tipo eleccion)." },
      { name: "avatarColor", type: "string", description: "Color de fondo del avatar." },
      { name: "onPress", type: "() => void", description: "Si se pasa, muestra chevron." },
    ],
    snippet: `import { CandidateCard } from "../components";

<CandidateCard
  name={c.nombre}
  partido={c.partido}
  initials={c.iniciales}
  matchPercent={c.matchPercent}
  onPress={() => navigate("DetalleCandidato", { id: c.id })}
/>`,
  },
  {
    name: "ProfileHero",
    path: "organisms/ProfileHero",
    category: "organisms",
    description: "Header de perfil de candidato. Avatar XL + partido pill + nombre + subtitulo + stats inline. Fondo tinted segun tilt.",
    variants: [
      {
        label: "con stats",
        render: () => (
          <ProfileHero
            name="Gabriel Boric Font"
            initials="GB"
            partido="Frente Amplio"
            subtitle="Presidente de Chile · 38 anios · Magallanes"
            tilt="left"
            stats={[
              { value: "87%", label: "Match" },
              { value: 42, label: "Posturas" },
              { value: 12, label: "Ejes" },
            ]}
          />
        ),
      },
      {
        label: "sin stats, tilt=right",
        render: () => (
          <ProfileHero
            name="Jose Antonio Kast"
            initials="JK"
            partido="Republicanos"
            subtitle="Candidato · 57 anios · Region Metropolitana"
            tilt="right"
          />
        ),
      },
    ],
    props: [
      { name: "name / initials / partido / subtitle", type: "string", required: true },
      { name: "stats", type: "ReadonlyArray<{value, label}>" },
      { name: "tilt", type: "\"left\" | \"center\" | \"right\" | \"default\"", defaultValue: "\"default\"" },
    ],
    snippet: `import { ProfileHero } from "../components";

<ProfileHero
  name={candidato.nombre}
  initials={candidato.iniciales}
  partido={candidato.partido}
  subtitle={\`\${candidato.cargo} · \${candidato.edad} anios\`}
  tilt={candidato.tendencia}
  stats={[
    { value: \`\${match}%\`, label: "Match" },
    { value: posturas.length, label: "Posturas" },
  ]}
/>`,
  },
  {
    name: "ResultadoHero",
    path: "organisms/ResultadoHero",
    category: "organisms",
    description: "Card hero para el top match del ranking. Avatar XL + nombre + partido + % grande + radar chart + CTA.",
    variants: [
      {
        label: "completo (top match)",
        render: () => (
          <View style={{ maxWidth: 360 }}>
            <ResultadoHero
              nombre="Gabriel"
              apellido="Boric"
              partido="Frente Amplio"
              matchPct={87}
              ejeScores={ejeScoresMock}
              confianzaLabel="Alta confianza"
              confianzaVariant="success"
              ctaLabel="Ver perfil completo"
              onCta={() => {}}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "nombre / apellido / partido", type: "string", description: "apellido y partido opcionales." },
      { name: "matchPct", type: "number", required: true },
      { name: "matchColor", type: "string", description: "Override del color del %." },
      { name: "ejeScores", type: "Record<string, number>", description: "3+ ejes para mostrar radar." },
      { name: "confianzaLabel / confianzaVariant", type: "string / BadgeVariant" },
      { name: "ctaLabel", type: "string", defaultValue: "\"Ver perfil completo\"" },
      { name: "onCta", type: "() => void" },
    ],
    snippet: `import { ResultadoHero } from "../components";

<ResultadoHero
  nombre={top.nombre}
  apellido={top.apellido}
  partido={top.partido}
  matchPct={top.matchPercent}
  ejeScores={top.scoresByEje}
  onCta={() => navigate("DetalleCandidato", { id: top.id })}
/>`,
  },
  {
    name: "RankingRow",
    path: "organisms/RankingRow",
    category: "organisms",
    description: "Fila del ranking (posiciones 2+). Layout horizontal: #N + avatar + nombre/partido + mini radar + %.",
    variants: [
      {
        label: "row simple",
        render: () => (
          <RankingRow
            rank={2}
            nombre="Michelle"
            apellido="Bachelet"
            partido="Partido Socialista"
            matchPct={72}
            ejeScores={ejeScoresMock}
            onPress={() => {}}
          />
        ),
      },
      {
        label: "con actions",
        render: () => (
          <RankingRow
            rank={3}
            nombre="Jose Antonio"
            apellido="Kast"
            partido="Republicanos"
            matchPct={28}
            ejeScores={ejeScoresMock}
            onPress={() => {}}
            actions={
              <View style={{ paddingTop: 8 }}>
                <DemoText tone="secondary" style={{ fontSize: 11 }}>Slot custom para BookmarkActions u otras acciones.</DemoText>
              </View>
            }
          />
        ),
      },
    ],
    props: [
      { name: "rank", type: "number", required: true },
      { name: "nombre / apellido / partido", type: "string", description: "apellido y partido opcionales." },
      { name: "matchPct", type: "number", required: true },
      { name: "ejeScores", type: "Record<string, number>" },
      { name: "onPress", type: "() => void" },
      { name: "actions", type: "ReactNode", description: "Slot para BookmarkActions u otras acciones debajo." },
    ],
    snippet: `import { RankingRow, BookmarkActions } from "../components";

<RankingRow
  rank={i + 2}
  nombre={c.nombre}
  apellido={c.apellido}
  partido={c.partido}
  matchPct={c.matchPercent}
  ejeScores={c.scoresByEje}
  onPress={() => navigate("DetalleCandidato", { id: c.id })}
  actions={<BookmarkActions ... />}
/>`,
  },
  {
    name: "Comparator",
    path: "organisms/Comparator",
    category: "organisms",
    description: "2 columnas lado a lado para comparar candidatos. Si solo hay 1, la segunda columna es un add-slot dashed.",
    variants: [
      {
        label: "1 slot (con add)",
        render: () => (
          <View style={{ maxWidth: 500 }}>
            <Comparator
              slots={[
                {
                  name: "Boric",
                  partido: "Frente Amplio",
                  initials: "GB",
                  matchPercent: 87,
                  chart: <RadarChart data={ejeScoresMock} size={140} />,
                },
              ]}
              onRemove={() => {}}
              onAdd={() => {}}
            />
          </View>
        ),
      },
      {
        label: "2 slots",
        render: () => (
          <View style={{ maxWidth: 500 }}>
            <Comparator
              slots={[
                {
                  name: "Boric",
                  partido: "Frente Amplio",
                  initials: "GB",
                  matchPercent: 87,
                  chart: <RadarChart data={ejeScoresMock} size={140} />,
                },
                {
                  name: "Kast",
                  partido: "Republicanos",
                  initials: "JK",
                  matchPercent: 28,
                  chart: <RadarChart data={ejeScoresMock} size={140} />,
                },
              ]}
              onRemove={() => {}}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "slots", type: "ReadonlyArray<ComparatorSlot>", required: true, description: "1 o 2 elementos. { name, partido, initials, matchPercent, chart? }" },
      { name: "onRemove", type: "(index: number) => void", description: "Si se pasa, muestra boton X en cada slot." },
      { name: "onAdd", type: "() => void", description: "Se activa cuando slots.length === 1." },
    ],
    snippet: `import { Comparator } from "../components";

<Comparator
  slots={selected.map((c) => ({
    name: c.nombre,
    partido: c.partido,
    initials: c.iniciales,
    matchPercent: c.matchPercent,
    chart: <RadarChart data={c.scoresByEje} size={140} />,
  }))}
  onRemove={(i) => removeSlot(i)}
  onAdd={() => openPickerModal()}
/>`,
  },
  {
    name: "MatchExplanation",
    path: "organisms/MatchExplanation",
    category: "organisms",
    description: "Panel colapsable con desglose pregunta-a-pregunta del match. Fetchea data via useMatchDetalle lazy (solo al expandir).",
    variants: [
      {
        label: "no demoable aqui",
        render: () => (
          <View style={{ padding: 12 }}>
            <DemoText tone="secondary" style={{ fontSize: 13 }}>
              Requiere QueryClient con API viva (usa useMatchDetalle). Ver en uso desde DetalleCandidatoScreen.
            </DemoText>
          </View>
        ),
      },
    ],
    props: [
      { name: "candidatoId", type: "number | undefined", required: true, description: "Si undefined, no fetchea." },
    ],
    snippet: `import { MatchExplanation } from "../components";

<MatchExplanation candidatoId={candidato.id} />`,
  },
  {
    name: "CandidatoPosturas",
    path: "organisms/CandidatoPosturas",
    category: "organisms",
    description: "Seccion de posturas de un candidato agrupadas por eje tematico. Coloreadas por valor Likert (verde acuerdo, rojo desacuerdo, gris neutral). Extrae URL de justificacion.",
    variants: [
      {
        label: "no demoable aqui",
        render: () => (
          <View style={{ padding: 12 }}>
            <DemoText tone="secondary" style={{ fontSize: 13 }}>
              Requiere PosturaCandidatoDetalle[] del API. Ver en uso desde DetalleCandidatoScreen.
            </DemoText>
          </View>
        ),
      },
    ],
    props: [
      { name: "posturas", type: "PosturaCandidatoDetalle[]", required: true, description: "Del API. { pregunta, valor_likert, justificacion, eje_tematico, ... }" },
      { name: "loading", type: "boolean" },
    ],
    snippet: `import { CandidatoPosturas } from "../components";

const { data, isLoading } = useCandidato(id);
<CandidatoPosturas posturas={data?.posturas ?? []} loading={isLoading} />`,
  },
];
