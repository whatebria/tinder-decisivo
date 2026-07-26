/**
 * Catalogo de organismos: relacionados a candidatos.
 *
 * Incluye: CandidateCard, ProfileHero, ResultadoHero, RankingRow, Comparator,
 * MatchExplanation, CandidatoPosturas, SwipeCard (organism con swipe gestual).
 */

import React from "react";
import { Text, View } from "react-native";

import {
  CandidateCard,
  Comparator,
  ProfileHero,
  RankingRow,
  ResultadoHero,
} from "../../../../components";
import { SwipeCard as SwipeCardOrg } from "../../../../components/organisms/SwipeCard";
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
    ],
    props: [
      { name: "name", type: "string", required: true },
      { name: "partido", type: "string", required: true },
      { name: "initials", type: "string", required: true },
      { name: "matchPercent", type: "number", required: true, description: "0-100." },
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
      {
        label: "isDecision (tu voto)",
        render: () => (
          <View style={{ maxWidth: 360 }}>
            <ResultadoHero
              nombre="Michelle"
              apellido="Bachelet"
              partido="Partido Socialista"
              matchPct={72}
              isDecision
              ejeScores={ejeScoresMock}
              ctaLabel="Ver perfil"
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
      { name: "isDecision", type: "boolean", description: "Border-primary y label 'Tu voto'." },
    ],
    snippet: `import { ResultadoHero } from "../components";

<ResultadoHero
  nombre={top.nombre}
  apellido={top.apellido}
  partido={top.partido}
  matchPct={top.matchPercent}
  ejeScores={top.scoresByEje}
  isDecision={top.id === decisionId}
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
        label: "isDecision con actions",
        render: () => (
          <RankingRow
            rank={3}
            nombre="Jose Antonio"
            apellido="Kast"
            partido="Republicanos"
            matchPct={28}
            ejeScores={ejeScoresMock}
            isDecision
            onPress={() => {}}
            actions={
              <View style={{ paddingTop: 8 }}>
                <Text style={{ fontSize: 11, color: "#666" }}>Slot custom para BookmarkActions u otras acciones.</Text>
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
      { name: "isDecision", type: "boolean" },
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
                { name: "Boric", partido: "Frente Amplio", initials: "GB", matchPercent: 87 },
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
                { name: "Boric", partido: "Frente Amplio", initials: "GB", matchPercent: 87 },
                { name: "Kast", partido: "Republicanos", initials: "JK", matchPercent: 28 },
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
    name: "SwipeCard (organism)",
    path: "organisms/SwipeCard",
    category: "organisms",
    description: "Wrapper con soporte de swipe gestual (Animated + PanResponder). Diferente al SwipeCard molecule (que es el visual). El organism envuelve al molecule para agregar gestos.",
    variants: [
      {
        label: "con children (dummy card)",
        render: () => (
          <View style={{ maxWidth: 340, height: 200 }}>
            <SwipeCardOrg
              onSwipedLeft={() => console.log("nope")}
              onSwipedRight={() => console.log("like")}
              onTap={() => console.log("tap")}
            >
              <View style={{ padding: 24, backgroundColor: "#F0F0F0", borderRadius: 16, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Arrastrame!</Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Izq = nope · Der = like · tap corto = onTap</Text>
              </View>
            </SwipeCardOrg>
          </View>
        ),
      },
    ],
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Contenido de la card (tipicamente el molecule SwipeCard)." },
      { name: "onSwipedLeft", type: "() => void", required: true, description: "Descartar / nope." },
      { name: "onSwipedRight", type: "() => void", required: true, description: "Favorito / like." },
      { name: "onTap", type: "() => void", description: "Tap corto sin drag." },
      { name: "disabled", type: "boolean", description: "Deshabilita el gesto (card debajo del stack)." },
      { name: "scaleBelow", type: "number", defaultValue: "1", description: "Escala para feedback de 'card debajo del stack'." },
    ],
    snippet: `import { SwipeCard as SwipeCardOrg, SwipeCard as SwipeCardMol } from "../components";

<SwipeCardOrg
  onSwipedLeft={() => dislike(candidato.id)}
  onSwipedRight={() => like(candidato.id)}
  onTap={() => openDetalle(candidato.id)}
>
  <SwipeCardMol name={...} />
</SwipeCardOrg>`,
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
            <Text style={{ fontSize: 13, color: "#666" }}>
              Requiere QueryClient con API viva (usa useMatchDetalle). Ver en uso desde DetalleCandidatoScreen.
            </Text>
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
            <Text style={{ fontSize: 13, color: "#666" }}>
              Requiere PosturaCandidatoDetalle[] del API. Ver en uso desde DetalleCandidatoScreen.
            </Text>
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
