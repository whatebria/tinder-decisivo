/**
 * Catalogo de moleculas: CARDS e items de contenido.
 *
 * Incluye: NewsCard, PosturaItem, NovedadItem, MatchTier.
 */

import React from "react";
import { View } from "react-native";

import {
  DimensionCard,
  MatchSummaryCard,
  MatchTier,
  NewsCard,
  NovedadItem,
  PosturaItem,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

function NewsCardWithBookmark() {
  const [saved, setSaved] = React.useState(false);
  return (
    <NewsCard
      headline="Boric presenta reforma tributaria con nuevos tramos para altos ingresos"
      snippet="El proyecto contempla aumentar impuestos a rentas sobre 4M mensuales y crear royalty minero..."
      source="La Tercera"
      when="hace 3 horas"
      sentiment="neutral"
      bookmarked={saved}
      onToggleBookmark={() => setSaved(!saved)}
    />
  );
}

export const cardsCatalog: CatalogEntry[] = [
  {
    name: "MatchSummaryCard",
    path: "molecules/MatchSummaryCard",
    category: "molecules",
    description:
      "Hero card horizontal de la seccion 'Tus mejores matches' del Home HUB. Muestra por cada eleccion completada el candidato con mayor afinidad: Avatar (foto o iniciales) + nombre + chip del tipo + porcentaje gigante + contexto 'coincides en N de N preguntas' + CTA 'Ver perfil'. Compone atoms Avatar/Chip/Button, no maneja fetching.",
    variants: [
      {
        label: "match alto con foto",
        render: () => (
          <MatchSummaryCard
            candidatoNombre="Ada Perez"
            candidatoFotoUrl={null}
            tipoEleccionNombre="Presidencial"
            matchPercent={87}
            preguntasConsideradas={12}
            totalPreguntas={12}
            onVerPerfil={() => {}}
          />
        ),
      },
      {
        label: "match medio (parcial)",
        render: () => (
          <MatchSummaryCard
            candidatoNombre="Gabriel Boric"
            tipoEleccionNombre="Senatorial"
            matchPercent={55}
            preguntasConsideradas={8}
            totalPreguntas={10}
            onVerPerfil={() => {}}
          />
        ),
      },
      {
        label: "nombre compuesto (iniciales primera+ultima)",
        render: () => (
          <MatchSummaryCard
            candidatoNombre="Maria Jose Perez Gonzalez"
            tipoEleccionNombre="Consejeros Regionales"
            matchPercent={72}
            preguntasConsideradas={9}
            totalPreguntas={12}
            onVerPerfil={() => {}}
          />
        ),
      },
    ],
    props: [
      { name: "candidatoNombre", type: "string", required: true, description: "Nombre completo. Se derivan iniciales si no hay foto." },
      { name: "candidatoFotoUrl", type: "string | null", description: "URL opcional. Fallback a iniciales." },
      { name: "tipoEleccionNombre", type: "string", required: true, description: "Va dentro del Chip." },
      { name: "matchPercent", type: "number", required: true, description: "0-100. Se redondea al pintar." },
      { name: "preguntasConsideradas", type: "number", required: true },
      { name: "totalPreguntas", type: "number", required: true },
      { name: "onVerPerfil", type: "() => void", required: true, description: "CTA principal." },
      { name: "style", type: "ViewStyle" },
      { name: "accessibilityLabel", type: "string", description: "Default: auto-generado desde nombre + %." },
    ],
    snippet: `import { MatchSummaryCard } from "../components";

<MatchSummaryCard
  candidatoNombre={candidato.nombre}
  candidatoFotoUrl={candidato.profile_picture}
  tipoEleccionNombre={eleccion.nombre}
  matchPercent={top.match_percentage}
  preguntasConsideradas={top.preguntas_consideradas}
  totalPreguntas={eleccion.total_preguntas}
  onVerPerfil={() => navigate("DetalleCandidato", { candidatoId: candidato.id })}
/>`,
  },
  {
    name: "MatchTier",
    path: "molecules/MatchTier",
    category: "molecules",
    description: "Badge de nivel de match usuario-candidato. Alto (>=70%) verde, medio (40-69%) info, bajo (<40%) warning.",
    variants: [
      { label: "high (87%)", render: () => <MatchTier percent={87} /> },
      { label: "mid (55%)", render: () => <MatchTier percent={55} /> },
      { label: "low (28%)", render: () => <MatchTier percent={28} /> },
      { label: "tier explicito sin %", render: () => <MatchTier tier="high" /> },
      { label: "label custom", render: () => <MatchTier tier="mid" label="Coincidencia parcial" /> },
    ],
    props: [
      { name: "percent", type: "number", description: "0-100. Si se pasa, calcula el tier automaticamente." },
      { name: "tier", type: "\"high\" | \"mid\" | \"low\"", description: "Sobrescribe el calculado por percent." },
      { name: "label", type: "string", description: "Default: 'Match alto/medio/bajo · X%'." },
      { name: "showPercent", type: "boolean", description: "Default: true cuando hay percent." },
    ],
    snippet: `import { MatchTier } from "../components";

<MatchTier percent={candidato.matchPercent} />`,
  },
  {
    name: "NewsCard",
    path: "molecules/NewsCard",
    category: "molecules",
    description: "Item de noticia con thumb tinted por sentiment + headline + snippet + meta. Bookmark opcional.",
    variants: [
      {
        label: "positive",
        render: () => (
          <NewsCard
            headline="Kast lidera encuesta con 32% en primera vuelta"
            snippet="La encuesta CADEM muestra al candidato republicano en primer lugar, seguido de Boric con 28%..."
            source="El Mercurio"
            when="hace 1 hora"
            sentiment="positive"
          />
        ),
      },
      {
        label: "con bookmark interactivo",
        render: () => <NewsCardWithBookmark />,
      },
      {
        label: "negative",
        render: () => (
          <NewsCard
            headline="Denuncian financiamiento irregular en campana municipal"
            snippet="El Servel abrio investigacion contra un candidato por presuntas donaciones no declaradas..."
            source="BioBio"
            when="ayer"
            sentiment="negative"
          />
        ),
      },
    ],
    props: [
      { name: "headline", type: "string", required: true, description: "Max 2 lineas." },
      { name: "snippet", type: "string", required: true, description: "Max 2 lineas." },
      { name: "source", type: "string", required: true },
      { name: "when", type: "string", required: true, description: "Timestamp ya formateado ('hace 3 horas', 'ayer')." },
      { name: "sentiment", type: "\"positive\" | \"neutral\" | \"negative\"", required: true },
      { name: "onPress", type: "() => void" },
      { name: "bookmarked", type: "boolean", description: "Si esta definido, se muestra el chip de bookmark." },
      { name: "onToggleBookmark", type: "() => void" },
      { name: "bookmarkLoading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { NewsCard } from "../components";

<NewsCard
  headline={news.title}
  snippet={news.summary}
  source={news.source}
  when={formatWhen(news.publishedAt)}
  sentiment={news.sentiment}
  onPress={() => openArticle(news.url)}
  bookmarked={news.isBookmarked}
  onToggleBookmark={() => toggleBookmark(news.id)}
/>`,
  },
  {
    name: "PosturaItem",
    path: "molecules/PosturaItem",
    category: "molecules",
    description: "Compara respuesta del usuario vs candidato. Border-left semantico segun tipo de match.",
    variants: [
      {
        label: "match total",
        render: () => (
          <PosturaItem
            question="Se debe aumentar el gasto en salud publica financiado con mas impuestos"
            userAnswer="De acuerdo"
            candidateAnswer="De acuerdo"
            candidateName="Boric"
            match="match"
          />
        ),
      },
      {
        label: "partial",
        render: () => (
          <PosturaItem
            question="Se debe eliminar el sistema ISAPRE"
            userAnswer="Muy de acuerdo"
            candidateAnswer="Neutral"
            candidateName="Bachelet"
            match="partial"
          />
        ),
      },
      {
        label: "no-match",
        render: () => (
          <PosturaItem
            question="Se debe aumentar la pena minima por delitos violentos"
            userAnswer="En desacuerdo"
            candidateAnswer="Muy de acuerdo"
            candidateName="Kast"
            match="no-match"
          />
        ),
      },
    ],
    props: [
      { name: "question", type: "string", required: true },
      { name: "userAnswer", type: "string", required: true },
      { name: "candidateAnswer", type: "string", required: true },
      { name: "candidateName", type: "string", defaultValue: "\"Candidato\"" },
      { name: "match", type: "\"match\" | \"partial\" | \"no-match\"", required: true },
      { name: "matchLabel", type: "string", description: "Default segun match." },
      { name: "bookmarked", type: "boolean", description: "Si definido, muestra bookmark." },
      { name: "onToggleBookmark", type: "() => void" },
    ],
    snippet: `import { PosturaItem } from "../components";

<PosturaItem
  question={postura.pregunta}
  userAnswer={postura.miRespuesta}
  candidateAnswer={postura.respuestaCandidato}
  candidateName={candidato.nombre}
  match={postura.tipo}
/>`,
  },
  {
    name: "NovedadItem",
    path: "molecules/NovedadItem",
    category: "molecules",
    description: "Item del feed 'Novedades' del Home HUB. 3 kinds: action (CTA), noticia (thumb+meta), update (avatar+texto).",
    variants: [
      {
        label: "action",
        render: () => (
          <NovedadItem
            kind="action"
            icon="alert"
            title="Complete 3 preguntas mas"
            subtitle="Para desbloquear tu match completo"
            ctaLabel="Ir al cuestionario"
            onCta={() => {}}
          />
        ),
      },
      {
        label: "noticia",
        render: () => (
          <NovedadItem
            kind="noticia"
            title="Debate presidencial se realizara el 15 de noviembre"
            snippet="El CNTV confirmo la fecha del primer debate obligatorio entre los candidatos..."
            category="Electoral"
            when="hace 2h"
          />
        ),
      },
      {
        label: "update",
        render: () => (
          <NovedadItem
            kind="update"
            avatarInitials="JB"
            title="Boric publico nueva postura sobre educacion"
            subtitle="Ahora coincides 89%"
          />
        ),
      },
    ],
    props: [
      { name: "kind", type: "\"action\" | \"noticia\" | \"update\"", required: true, description: "Determina las props adicionales (discriminated union)." },
      { name: "title", type: "string", required: true },
      { name: "onPress", type: "() => void" },
      { name: "[action] icon", type: "IconName", defaultValue: "\"bell\"" },
      { name: "[action] subtitle / ctaLabel / onCta", type: "string / string / () => void" },
      { name: "[noticia] imageUrl / snippet / category / when", type: "string" },
      { name: "[update] avatarInitials / subtitle", type: "string" },
    ],
    snippet: `import { NovedadItem } from "../components";

<NovedadItem
  kind="action"
  icon="alert"
  title="Complete 3 preguntas mas"
  ctaLabel="Ir"
  onCta={() => navigate("Cuestionario")}
/>`,
  },
  {
    name: "DimensionCard",
    path: "molecules/DimensionCard",
    category: "molecules",
    description:
      "Card para mostrar el impacto de algo (ej: una pregunta del cuestionario) sobre una dimension tematica del dominio. Composicion: borde izquierdo del color de dimension + header con DimensionBadge + label coloreado + body de texto. Consume src/domain/dimensiones.ts + useDimensionColors, contraste WCAG AA garantizado en ambos themes.",
    variants: [
      {
        label: "economico",
        render: () => (
          <DimensionCard dimension="economico">
            Mayor gasto publico requiere subir impuestos o reasignar recursos.
          </DimensionCard>
        ),
      },
      {
        label: "institucional",
        render: () => (
          <DimensionCard dimension="institucional">
            Fortalece FONASA respecto del sistema privado.
          </DimensionCard>
        ),
      },
      {
        label: "ambiental",
        render: () => (
          <DimensionCard dimension="ambiental">
            Impacto directo sobre ecosistemas y matriz energetica.
          </DimensionCard>
        ),
      },
    ],
    props: [
      {
        name: "dimension",
        type: '"economico" | "social" | "cultural" | "ambiental" | "institucional"',
        required: true,
      },
      { name: "children", type: "ReactNode", required: true, description: "String o nodos custom." },
      { name: "labelOverride", type: "string", description: "Override del label si se necesita algo distinto al del catalogo." },
    ],
    snippet: `import { DimensionCard } from "../components";

<DimensionCard dimension="institucional">
  Fortalece FONASA respecto del sistema privado.
</DimensionCard>`,
  },
];
