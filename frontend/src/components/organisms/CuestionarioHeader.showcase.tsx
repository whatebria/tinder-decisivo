/**
 * Showcase de CuestionarioHeader.
 * Header sticky del cuestionario con fondo brand-primary fijo.
 * Documentado junto con la justificacion de diseño (ver JSDoc del componente).
 */

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CuestionarioHeader } from "./CuestionarioHeader";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo" | "dsReference"
>;

const showcase: ShowcaseEntry = {
  description:
    "Header sticky del cuestionario. Barra de navegacion (volver + titulo + info) + progress bar sobre fondo DS-11 brand-primary (#2E5F7E). Color fijo en light y dark: es identidad de 'modo concentrado', no superficie del sistema de temas.",

  status: "stable",

  a11y: [
    "accessibilityRole='header' en el contenedor raiz.",
    "progressbar con accessibilityValue { min:0, max:100, now } para screen readers.",
    "Botones 'Volver' e 'Info' con accessibilityLabel explicito y hitSlop=8.",
    "Contraste #FFFFFF/#2E5F7E = 5.5:1. Cumple WCAG 2.2 AA.",
    "Solo se renderiza el boton Volver si se pasa onBack. Igual para onInfo.",
  ],

  doNotUse: [
    "No usar ScreenTopBar para el cuestionario: usa c.text/c.border2 que son invisibles sobre fondo primary.",
    "No cambiar HEADER_BG dinamicamente via prop: el contexto de color fijo es intencional (identidad visual).",
    "No colocarlo dentro del ScrollView — debe quedar fuera para sticky behavior.",
  ],

  relatedTo: ["ScreenTopBar", "ProgressSplit", "Progress"],
  dsReference: "DS-11 Brand",

  variants: [
    {
      label: "flujo normal (onBack + onInfo)",
      render: () => (
        <CuestionarioHeader
          title="Presidencial 2025"
          subtitle="5 de 12 · base"
          respondidas={5}
          totalPreguntas={12}
          onBack={() => {}}
          onInfo={() => {}}
        />
      ),
    },
    {
      label: "primera pregunta (sin onBack)",
      render: () => (
        <CuestionarioHeader
          title="Presidencial 2025"
          subtitle="1 de 12 · base"
          respondidas={0}
          totalPreguntas={12}
          onInfo={() => {}}
        />
      ),
    },
    {
      label: "100% completado",
      render: () => (
        <CuestionarioHeader
          title="Presidencial 2025"
          subtitle="12 de 12 · base"
          respondidas={12}
          totalPreguntas={12}
          onBack={() => {}}
        />
      ),
    },
    {
      label: "sin subtitle (solo titulo)",
      render: () => (
        <CuestionarioHeader
          title="Preguntas generales"
          respondidas={3}
          totalPreguntas={8}
          onBack={() => {}}
        />
      ),
    },
  ],

  props: [
    { name: "title", type: "string", required: true, description: "Nombre del tipo de eleccion. Ej: 'Presidencial 2025'." },
    { name: "subtitle", type: "string", description: "'N de M · base'. Pre-computado por el screen." },
    { name: "respondidas", type: "number", required: true, description: "Preguntas respondidas. Controla el ancho de la progress bar." },
    { name: "totalPreguntas", type: "number", required: true, description: "Total de preguntas del cuestionario." },
    { name: "onBack", type: "() => void", description: "Si se omite, el placeholder ocupa el espacio del boton sin renderizar nada." },
    { name: "onInfo", type: "() => void", description: "Si se omite, el placeholder ocupa el espacio del boton sin renderizar nada." },
  ],

  snippet: `import { CuestionarioHeader } from "@/components";

// CuestionarioScreen: fuera del ScrollView
<CuestionarioHeader
  title={tipoEleccion?.nombre ?? "Cuestionario"}
  subtitle={\`\${index + 1} de \${totalPreguntas} · \${esTipoBase ? "base" : "especifico"}\`}
  respondidas={index}
  totalPreguntas={totalPreguntas}
  onBack={canGoBack ? navigation.goBack : undefined}
  onInfo={() => setInfoVisible(true)}
/>

<ScrollView>
  {/* preguntas */}
</ScrollView>`,
};

export default showcase;
