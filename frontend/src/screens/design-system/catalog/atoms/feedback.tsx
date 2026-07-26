/**
 * Catalogo de atomos: FEEDBACK y estado.
 *
 * Incluye: Badge, SentimentBadge, Progress, Spinner, PageDots, Tooltip, Divider.
 */

import React from "react";
import { Text, View } from "react-native";

import {
  Badge,
  Divider,
  PageDots,
  Progress,
  SentimentBadge,
  Spinner,
  Tooltip,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

export const feedbackCatalog: CatalogEntry[] = [
  {
    name: "Badge",
    path: "atoms/Badge",
    category: "atoms",
    description: "Chip compacto para status. 5 variantes semanticas con contraste WCAG AA verificado.",
    variants: [
      { label: "neutral", render: () => <Badge>Neutral</Badge> },
      { label: "success", render: () => <Badge variant="success">Alta confianza</Badge> },
      { label: "warning", render: () => <Badge variant="warning">Verificar</Badge> },
      { label: "info", render: () => <Badge variant="info">Info</Badge> },
      { label: "danger", render: () => <Badge variant="danger">Error</Badge> },
    ],
    props: [
      { name: "children", type: "string", required: true },
      { name: "variant", type: "\"neutral\" | \"success\" | \"warning\" | \"info\" | \"danger\"", defaultValue: "\"neutral\"" },
    ],
    snippet: `import { Badge } from "../components";

<Badge variant="success">Alta confianza</Badge>`,
  },
  {
    name: "SentimentBadge",
    path: "atoms/SentimentBadge",
    category: "atoms",
    description: "Indicador de tono de noticia. Puntito de color + label. NO depende solo del color (a11y).",
    variants: [
      { label: "positive", render: () => <SentimentBadge sentiment="positive" /> },
      { label: "neutral", render: () => <SentimentBadge sentiment="neutral" /> },
      { label: "negative", render: () => <SentimentBadge sentiment="negative" /> },
      { label: "label custom", render: () => <SentimentBadge sentiment="positive" label="Favorable" /> },
    ],
    props: [
      { name: "sentiment", type: "\"positive\" | \"neutral\" | \"negative\"", required: true },
      { name: "label", type: "string", description: "Override del label default (Positivo/Neutral/Negativo)." },
    ],
    snippet: `import { SentimentBadge } from "../components";

<SentimentBadge sentiment="positive" />`,
  },
  {
    name: "Progress",
    path: "atoms/Progress",
    category: "atoms",
    description: "Barra de progreso horizontal. Verde salvia para sensacion organica. Value 0-1 con clamp automatico.",
    variants: [
      { label: "0%", render: () => <View style={{ width: 200 }}><Progress value={0} /></View> },
      { label: "50%", render: () => <View style={{ width: 200 }}><Progress value={0.5} /></View> },
      { label: "100%", render: () => <View style={{ width: 200 }}><Progress value={1} /></View> },
      { label: "height custom", render: () => <View style={{ width: 200 }}><Progress value={0.75} height={16} /></View> },
    ],
    props: [
      { name: "value", type: "number", required: true, description: "0 a 1. Se clampea automaticamente." },
      { name: "height", type: "number", defaultValue: "8", description: "Alto de la barra en px." },
    ],
    snippet: `import { Progress } from "../components";

<Progress value={completed / total} />`,
  },
  {
    name: "Spinner",
    path: "atoms/Spinner",
    category: "atoms",
    description: "ActivityIndicator con color del design system. 3 variantes de color, cualquier size.",
    variants: [
      { label: "primary / small", render: () => <Spinner /> },
      { label: "primary / large", render: () => <Spinner size="large" /> },
      { label: "secondary", render: () => <Spinner variant="secondary" size="large" /> },
      {
        label: "onPrimary (sobre bg color)",
        render: () => (
          <View style={{ padding: 8, backgroundColor: "#2E5F7E", borderRadius: 8 }}>
            <Spinner variant="onPrimary" />
          </View>
        ),
      },
    ],
    props: [
      { name: "variant", type: "\"primary\" | \"secondary\" | \"onPrimary\"", defaultValue: "\"primary\"" },
      { name: "size", type: "\"small\" | \"large\" | number", defaultValue: "\"small\"" },
      { name: "...ActivityIndicatorProps", type: "-", description: "Hereda API de ActivityIndicator." },
    ],
    snippet: `import { Spinner } from "../components";

{loading ? <Spinner size="large" /> : <Content />}`,
  },
  {
    name: "PageDots",
    path: "atoms/PageDots",
    category: "atoms",
    description: "Indicador de posicion multi-paso. Dot activo se expande a pill. Pasos hechos van en verde.",
    variants: [
      { label: "5 pasos, en 0", render: () => <PageDots total={5} current={0} /> },
      { label: "5 pasos, en 2", render: () => <PageDots total={5} current={2} /> },
      { label: "5 pasos, en 4", render: () => <PageDots total={5} current={4} /> },
      { label: "3 pasos, en 1", render: () => <PageDots total={3} current={1} /> },
    ],
    props: [
      { name: "total", type: "number", required: true },
      { name: "current", type: "number", required: true, description: "Indice 0-based del step activo." },
    ],
    snippet: `import { PageDots } from "../components";

<PageDots total={5} current={activeSlide} />`,
  },
  {
    name: "Tooltip",
    path: "atoms/Tooltip",
    category: "atoms",
    description: "Bubble contextual que aparece en long-press (RN no tiene hover). Auto-oculta al soltar.",
    variants: [
      {
        label: "top (default)",
        render: () => (
          <View style={{ paddingTop: 40 }}>
            <Tooltip tip="Este es un tooltip">
              <Text style={{ padding: 8, fontSize: 14 }}>Manten pulsado</Text>
            </Tooltip>
          </View>
        ),
      },
      {
        label: "visible controlado",
        render: () => (
          <View style={{ paddingTop: 40 }}>
            <Tooltip tip="Estoy siempre visible" visible>
              <Text style={{ padding: 8, fontSize: 14 }}>Elemento</Text>
            </Tooltip>
          </View>
        ),
      },
    ],
    props: [
      { name: "tip", type: "string", required: true, description: "Texto del bubble." },
      { name: "children", type: "ReactNode", required: true, description: "Elemento sobre el que se muestra." },
      { name: "position", type: "\"top\" | \"bottom\"", defaultValue: "\"top\"" },
      { name: "visible", type: "boolean", description: "Modo controlado. Si no se pasa, se toggle en long-press." },
    ],
    snippet: `import { Tooltip } from "../components";

<Tooltip tip="Esta accion es irreversible">
  <IconButton accessibilityLabel="Info"><Icon name="info" /></IconButton>
</Tooltip>`,
  },
  {
    name: "Divider",
    path: "atoms/Divider",
    category: "atoms",
    description: "Linea separadora hairline. Horizontal (default) o vertical.",
    variants: [
      {
        label: "horizontal",
        render: () => (
          <View style={{ width: 200 }}>
            <Text style={{ marginBottom: 8 }}>Arriba</Text>
            <Divider />
            <Text style={{ marginTop: 8 }}>Abajo</Text>
          </View>
        ),
      },
      {
        label: "vertical",
        render: () => (
          <View style={{ flexDirection: "row", height: 60, alignItems: "center", gap: 12 }}>
            <Text>Izq</Text>
            <Divider orientation="vertical" />
            <Text>Der</Text>
          </View>
        ),
      },
    ],
    props: [
      { name: "orientation", type: "\"horizontal\" | \"vertical\"", defaultValue: "\"horizontal\"" },
    ],
    snippet: `import { Divider } from "../components";

<Text>Seccion 1</Text>
<Divider />
<Text>Seccion 2</Text>`,
  },
];
