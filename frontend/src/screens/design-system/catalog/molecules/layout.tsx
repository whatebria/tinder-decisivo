/**
 * Catalogo de moleculas: LAYOUT, NAV y progreso.
 *
 * Incluye: SectionTitle, ScreenTopBar, HomeGreeting, ProgressSplit, ProgressStepper.
 */

import React from "react";
import { View } from "react-native";

import {
  HomeGreeting,
  ProgressSplit,
  ProgressStepper,
  ScreenTopBar,
  SectionTitle,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

export const layoutMoleculesCatalog: CatalogEntry[] = [
  {
    name: "SectionTitle",
    path: "molecules/SectionTitle",
    category: "molecules",
    description: "Header de seccion. H2 (18px) o H3 (16px). Link 'Ver todos ›' opcional a la derecha.",
    variants: [
      { label: "solo titulo", render: () => <SectionTitle title="Novedades" /> },
      { label: "con action link", render: () => <SectionTitle title="Novedades" actionLabel="Ver todos" onAction={() => {}} /> },
      { label: "h3", render: () => <SectionTitle title="Subtitulo h3" level="h3" /> },
    ],
    props: [
      { name: "title", type: "string", required: true },
      { name: "level", type: "\"h2\" | \"h3\"", defaultValue: "\"h2\"" },
      { name: "actionLabel", type: "string", description: "Si se omite, no se renderiza el link." },
      { name: "onAction", type: "() => void" },
    ],
    snippet: `import { SectionTitle } from "../components";

<SectionTitle
  title="Novedades"
  actionLabel="Ver todas"
  onAction={() => navigate("Novedades")}
/>`,
  },
  {
    name: "ScreenTopBar",
    path: "molecules/ScreenTopBar",
    category: "molecules",
    description: "Top bar de pantallas internas: back + titulo centrado + info opcional. Layout [<-] Titulo [i].",
    variants: [
      {
        label: "completa",
        render: () => (
          <View style={{ width: "100%" }}>
            <ScreenTopBar
              title="Cuestionario"
              subtitle="PREGUNTA 3 DE 12"
              onBack={() => {}}
              onInfo={() => {}}
            />
          </View>
        ),
      },
      {
        label: "sin subtitulo ni info",
        render: () => (
          <View style={{ width: "100%" }}>
            <ScreenTopBar title="Mi perfil" onBack={() => {}} />
          </View>
        ),
      },
    ],
    props: [
      { name: "title", type: "string", required: true },
      { name: "subtitle", type: "string" },
      { name: "onBack", type: "() => void", description: "Si no se pasa, deja un placeholder a la izq para mantener centrado." },
      { name: "onInfo", type: "() => void", description: "Si no se pasa, no muestra el boton info a la derecha." },
    ],
    snippet: `import { ScreenTopBar } from "../components";

<ScreenTopBar
  title="Cuestionario"
  subtitle={\`Pregunta \${current} de \${total}\`}
  onBack={() => navigation.goBack()}
  onInfo={() => setShowInfo(true)}
/>`,
  },
  {
    name: "HomeGreeting",
    path: "molecules/HomeGreeting",
    category: "molecules",
    description: "H1 saludo + subtitulo con posible enfasis en un valor (segmento primary).",
    variants: [
      {
        label: "con enfasis",
        render: () => (
          <HomeGreeting
            title="Buenos dias, Jenny"
            subtitleBefore="Faltan "
            emphasized="42 dias"
            subtitleAfter=" para las presidenciales"
          />
        ),
      },
      {
        label: "sin enfasis",
        render: () => (
          <HomeGreeting
            title="Hola de nuevo"
            subtitle="Bienvenida a Tinder Decisivo"
          />
        ),
      },
    ],
    props: [
      { name: "title", type: "string", required: true },
      { name: "subtitle", type: "string", description: "Subtitulo simple sin enfasis." },
      { name: "subtitleBefore / emphasized / subtitleAfter", type: "string", description: "Compone un subtitulo con un segmento destacado en color primary." },
    ],
    snippet: `import { HomeGreeting } from "../components";

<HomeGreeting
  title={\`Buenos dias, \${user.nombre}\`}
  subtitleBefore="Faltan "
  emphasized={\`\${diasFaltan} dias\`}
  subtitleAfter=" para las presidenciales"
/>`,
  },
  {
    name: "ProgressSplit",
    path: "molecules/ProgressSplit",
    category: "molecules",
    description: "Dos barras de progreso lado a lado. Proporcion configurable segun peso de cada segmento. Extras se apagan si total=0.",
    variants: [
      {
        label: "base + extras",
        render: () => (
          <View style={{ width: 260 }}>
            <ProgressSplit baseDone={8} baseTotal={12} extrasDone={2} extrasTotal={6} />
          </View>
        ),
      },
      {
        label: "sin extras (opaco)",
        render: () => (
          <View style={{ width: 260 }}>
            <ProgressSplit baseDone={5} baseTotal={12} extrasDone={0} extrasTotal={0} />
          </View>
        ),
      },
      {
        label: "labels custom",
        render: () => (
          <View style={{ width: 260 }}>
            <ProgressSplit
              baseDone={10}
              baseTotal={20}
              extrasDone={3}
              extrasTotal={5}
              baseLabel="Preguntas base"
              extrasLabel="Extras"
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "baseDone", type: "number", required: true },
      { name: "baseTotal", type: "number", required: true },
      { name: "extrasDone", type: "number", defaultValue: "0" },
      { name: "extrasTotal", type: "number", defaultValue: "0" },
      { name: "baseLabel", type: "string", description: "Default: 'Base (N)'." },
      { name: "extrasLabel", type: "string", description: "Default: 'Extras (N)'." },
    ],
    snippet: `import { ProgressSplit } from "../components";

<ProgressSplit
  baseDone={respuestasBase}
  baseTotal={12}
  extrasDone={respuestasExtras}
  extrasTotal={preguntasExtras}
/>`,
  },
  {
    name: "ProgressStepper",
    path: "molecules/ProgressStepper",
    category: "molecules",
    description: "Pasos numerados horizontales. Estados: done (verde), active (primary), pending (gris).",
    variants: [
      {
        label: "3 pasos, en el 2",
        render: () => (
          <View style={{ width: 400 }}>
            <ProgressStepper
              steps={[{ label: "Preguntas" }, { label: "Pesos" }, { label: "Resultados" }]}
              currentIndex={1}
            />
          </View>
        ),
      },
      {
        label: "todo done",
        render: () => (
          <View style={{ width: 400 }}>
            <ProgressStepper
              steps={[{ label: "Preguntas" }, { label: "Pesos" }, { label: "Resultados" }]}
              currentIndex={3}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "steps", type: "ReadonlyArray<{ label: string }>", required: true },
      { name: "currentIndex", type: "number", required: true, description: "0-based. Previos = done, siguientes = pending." },
    ],
    snippet: `import { ProgressStepper } from "../components";

<ProgressStepper
  steps={[
    { label: "Preguntas" },
    { label: "Pesos" },
    { label: "Resultados" },
  ]}
  currentIndex={currentStep}
/>`,
  },
];
