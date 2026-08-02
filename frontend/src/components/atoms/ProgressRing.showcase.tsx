/**
 * Showcase de ProgressRing.
 * Anillo de progreso SVG circular. Dos sizes: hero (72px) y sm (48px).
 * Usado en HomeHeroSection y HomeElectionItem.
 */

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ProgressRing } from "./ProgressRing";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo"
>;

const showcase: ShowcaseEntry = {
  description:
    "Anillo de progreso SVG circular. 3 estados: pending (sin progreso), progress (en curso), done (check). 2 sizes: hero (72px con label) y sm (48px). Usado en HomeHeroSection y HomeElectionItem.",

  status: "stable",

  a11y: [
    "No incluye accessibilityRole por defecto — el parent debe proveer el contexto ('progressbar' con accessibilityValue).",
    "El icono de check en estado 'done' es decorativo: el parent debe anunciar el estado completo via accessibilityLabel.",
    "No usar como unico indicador de progreso sin label visible en size='sm'.",
  ],

  doNotUse: [
    "No usar Progress (atom de barra horizontal) y ProgressRing en la misma pantalla para el mismo dato.",
    "No pasar value > 1 ni < 0 — el componente no hace clamp.",
    "No usar size='hero' dentro de listas de alta densidad — usar size='sm'.",
  ],

  relatedTo: ["Progress", "ProgressSplit"],

  variants: [
    {
      label: "hero / done (100%)",
      surface: "card",
      render: () => (
        <ProgressRing size="hero" value={1} label="100%" sublabel="listo" />
      ),
    },
    {
      label: "hero / progress (68%)",
      surface: "card",
      render: () => (
        <ProgressRing size="hero" value={0.68} label="68%" sublabel="afinidad" />
      ),
    },
    {
      label: "hero / pending (0%)",
      surface: "card",
      render: () => (
        <ProgressRing size="hero" value={0} />
      ),
    },
    {
      label: "sm / done",
      surface: "card",
      render: () => (
        <ProgressRing size="sm" value={1} showCheck />
      ),
    },
    {
      label: "sm / progress (40%)",
      surface: "card",
      render: () => (
        <ProgressRing size="sm" value={0.4} />
      ),
    },
    {
      label: "sm / pending",
      surface: "card",
      render: () => (
        <ProgressRing size="sm" value={0} />
      ),
    },
  ],

  props: [
    { name: "value", type: "number", required: true, description: "Progreso entre 0 y 1." },
    { name: "size", type: '"hero" | "sm"', defaultValue: '"sm"', description: "hero=72px con label, sm=48px sin label por defecto." },
    { name: "state", type: '"pending" | "progress" | "done"', description: "Se deriva automaticamente de value si no se pasa." },
    { name: "label", type: "string", description: "Label central (ej. '87%'). Solo visible en size='hero'." },
    { name: "sublabel", type: "string", description: "Sub-label debajo del label. Solo en size='hero'." },
    { name: "showCheck", type: "boolean", description: "Fuerza icono check (estado done)." },
    { name: "doneColor", type: "string", description: "Color del stroke en estado done. Default: c.success." },
    { name: "progressColor", type: "string", description: "Color del stroke en estado progress. Default: c.primary." },
  ],

  snippet: `import { ProgressRing } from "@/components";

// En HomeElectionItem (lista de elecciones del Home)
<ProgressRing
  size="sm"
  value={progresoCuestionario / 100}
  showCheck={isCompleted}
/>

// En HomeHeroSection (hero grande con porcentaje de match)
<ProgressRing
  size="hero"
  value={matchPercent / 100}
  label={\`\${matchPercent}%\`}
  sublabel="afinidad"
/>`,
};

export default showcase;
