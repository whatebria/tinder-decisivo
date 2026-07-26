/**
 * Catalogo de organismos: FEEDS y flujos.
 *
 * Incluye: QuestionCard, ElectionsStrip, NovedadesFeed, ShareOptions.
 */

import React from "react";
import { View } from "react-native";

import {
  ElectionsStrip,
  NovedadesFeed,
  QuestionCard,
  ShareOptions,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

function QuestionCardDemo() {
  const [v, setV] = React.useState<string | null>(null);
  return (
    <QuestionCard
      questionNumber={3}
      totalQuestions={12}
      category="Salud"
      question="El Estado deberia aumentar el gasto en salud publica financiado con mas impuestos"
      options={[
        { value: "strongly_agree", label: "Muy de acuerdo" },
        { value: "agree", label: "De acuerdo" },
        { value: "neutral", label: "Neutral" },
        { value: "disagree", label: "En desacuerdo" },
        { value: "strongly_disagree", label: "Muy en desacuerdo" },
      ]}
      value={v}
      onChange={setV}
      onSkip={() => {}}
      onPrev={() => {}}
      onNext={() => {}}
      nextDisabled={v === null}
    />
  );
}

export const feedsCatalog: CatalogEntry[] = [
  {
    name: "QuestionCard",
    path: "organisms/QuestionCard",
    category: "organisms",
    description: "Corazon del cuestionario. Header (N de M + categoria) + Progress + enunciado + RadioGroup + footer (No se / Volver / Siguiente).",
    variants: [
      { label: "interactive", render: () => <QuestionCardDemo /> },
      {
        label: "sin categoria ni skip",
        render: () => (
          <QuestionCard
            questionNumber={1}
            totalQuestions={5}
            question="Estas de acuerdo?"
            options={[
              { value: "yes", label: "Si" },
              { value: "no", label: "No" },
            ]}
            value={null}
            onChange={() => {}}
            onNext={() => {}}
            nextDisabled
          />
        ),
      },
    ],
    props: [
      { name: "questionNumber / totalQuestions", type: "number", required: true },
      { name: "category", type: "string", description: "Se muestra como Badge info." },
      { name: "question", type: "string", required: true },
      { name: "options", type: "ReadonlyArray<RadioOption<T>>", required: true },
      { name: "value", type: "T | null", required: true },
      { name: "onChange", type: "(v: T) => void", required: true },
      { name: "onSkip / onPrev / onNext", type: "() => void", description: "Botones solo se renderizan si el handler existe." },
      { name: "nextDisabled", type: "boolean" },
      { name: "canGoBack", type: "boolean", defaultValue: "true" },
    ],
    snippet: `import { QuestionCard } from "../components";

<QuestionCard
  questionNumber={index + 1}
  totalQuestions={preguntas.length}
  category={pregunta.eje_tematico_display}
  question={pregunta.texto}
  options={pregunta.opciones.map((o) => ({ value: o.id, label: o.texto }))}
  value={respuestas[pregunta.id]?.opcion_id ?? null}
  onChange={(id) => setRespuesta(pregunta.id, id)}
  onSkip={() => skip(pregunta.id)}
  onPrev={() => goPrev()}
  onNext={() => goNext()}
  nextDisabled={!respuestas[pregunta.id]}
  canGoBack={index > 0}
/>`,
  },
  {
    name: "ElectionsStrip",
    path: "organisms/ElectionsStrip",
    category: "organisms",
    description: "Scroll horizontal de ElectionCards + cards dashed '+ Activar {tipo}' al final. Del Home HUB > Tus elecciones.",
    variants: [
      {
        label: "3 elecciones + add",
        render: () => (
          <View style={{ maxWidth: 600 }}>
            <ElectionsStrip
              elections={[
                { key: "pres", name: "Presidencial", scope: "Nacional", daysLabel: "42d", matchPercent: 87, progressPercent: 100, variant: "active" },
                { key: "dip", name: "Diputados", scope: "D8", daysLabel: "42d", matchPercent: 62, progressPercent: 75 },
                { key: "cons", name: "Consejeros", scope: "RM", daysLabel: "42d", matchPercent: null, progressPercent: 40, pendingLabel: "6 preguntas extras pendientes" },
              ]}
              addOptions={[
                { key: "alcalde", label: "Alcalde", onPress: () => {} },
              ]}
            />
          </View>
        ),
      },
      {
        label: "solo elecciones",
        render: () => (
          <View style={{ maxWidth: 600 }}>
            <ElectionsStrip
              elections={[
                { key: "pres", name: "Presidencial", daysLabel: "42d", matchPercent: 87, progressPercent: 100, variant: "active" },
              ]}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "elections", type: "Array<ElectionCardProps & { key }>", required: true, description: "Cada card hereda las props de ElectionCard." },
      { name: "addOptions", type: "Array<{ key, label, onPress? }>", defaultValue: "[]", description: "Cards dashed '+ Activar {label}' al final." },
    ],
    snippet: `import { ElectionsStrip } from "../components";

<ElectionsStrip
  elections={misElecciones.map((e) => ({
    key: e.id,
    name: e.tipo,
    scope: e.scope,
    daysLabel: \`\${e.diasFaltan}d\`,
    matchPercent: e.matchPercent,
    progressPercent: e.progresoCuestionario,
    variant: e.id === selectedId ? "active" : undefined,
    onPress: () => setSelected(e.id),
  }))}
  addOptions={eleccionesDisponibles.map((e) => ({
    key: e.id,
    label: e.tipo,
    onPress: () => activarEleccion(e.id),
  }))}
/>`,
  },
  {
    name: "NovedadesFeed",
    path: "organisms/NovedadesFeed",
    category: "organisms",
    description: "Lista vertical de NovedadItems (feed mixto del HUB: action, noticia, update).",
    variants: [
      {
        label: "3 items mixtos",
        render: () => (
          <View style={{ maxWidth: 500 }}>
            <NovedadesFeed
              items={[
                {
                  key: "a1",
                  kind: "action",
                  icon: "alert",
                  title: "Complete 3 preguntas mas",
                  subtitle: "Para desbloquear tu match completo",
                  ctaLabel: "Ir",
                  onCta: () => {},
                },
                {
                  key: "n1",
                  kind: "noticia",
                  title: "Debate presidencial se realizara el 15 de noviembre",
                  snippet: "El CNTV confirmo la fecha del primer debate obligatorio...",
                  category: "Electoral",
                  when: "hace 2h",
                },
                {
                  key: "u1",
                  kind: "update",
                  avatarInitials: "GB",
                  title: "Boric publico nueva postura sobre educacion",
                  subtitle: "Ahora coincides 89%",
                },
              ]}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "items", type: "NovedadFeedItem[]", required: true, description: "Array de items con la misma shape que NovedadItem + key. Se determina por 'kind'." },
    ],
    snippet: `import { NovedadesFeed } from "../components";

<NovedadesFeed items={novedades.map((n) => ({ key: n.id, ...n }))} />`,
  },
  {
    name: "ShareOptions",
    path: "organisms/ShareOptions",
    category: "organisms",
    description: "Grid 2x2 de canales sociales (whatsapp, twitter, email, copy). Cada uno con color de marca sutil. Se usa dentro de un Modal.",
    variants: [
      { label: "4 canales default", render: () => <View style={{ maxWidth: 400 }}><ShareOptions onShare={() => {}} /></View> },
      { label: "solo copy + email", render: () => <View style={{ maxWidth: 400 }}><ShareOptions onShare={() => {}} channels={["copy", "email"]} /></View> },
    ],
    props: [
      { name: "onShare", type: "(channel: ShareChannel) => void", required: true, description: "ShareChannel = 'whatsapp' | 'twitter' | 'email' | 'copy'" },
      { name: "channels", type: "ReadonlyArray<ShareChannel>", defaultValue: "['whatsapp', 'twitter', 'email', 'copy']" },
    ],
    snippet: `import { ShareOptions } from "../components";

<ShareOptions
  onShare={(channel) => {
    if (channel === "copy") copyToClipboard(text);
    else if (channel === "whatsapp") openWhatsApp(text);
    // ...
  }}
/>`,
  },
];
