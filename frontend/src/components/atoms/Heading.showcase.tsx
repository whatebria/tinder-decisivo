import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Heading } from "./Heading";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Titulo semantico con role=\"header\" + aria-level correcto. 3 niveles (h1, h2, h3). Ejecuta typography.hN + color del tema. WCAG 2.4.6 (Headings and Labels) + 4.1.2 (Name, Role, Value).",
  variants: [
    { label: "level 1 (h1)", render: () => <Heading level={1}>Titulo principal</Heading> },
    { label: "level 2 (h2)", render: () => <Heading level={2}>Titulo de seccion</Heading> },
    { label: "level 3 (h3)", render: () => <Heading level={3}>Subseccion</Heading> },
    { label: "color custom", render: () => <Heading level={2} color="#B85C5C">Con color danger</Heading> },
    { label: "truncado a 1 linea", render: () => <Heading level={2} numberOfLines={1}>Este es un titulo largo que se corta con ellipsis cuando pasa una linea</Heading> },
  ],
  props: [
    { name: "level", type: "1 | 2 | 3", required: true, description: "Nivel semantico. Determina tanto el estilo como el aria-level." },
    { name: "children", type: "ReactNode", required: true },
    { name: "color", type: "string", description: "Color custom. Default: c.text del tema." },
    { name: "style", type: "StyleProp<TextStyle>", description: "Escape hatch para overrides puntuales (alignment, margin, etc)." },
    { name: "numberOfLines", type: "number", description: "Cortar a N lineas con ellipsis. Passthrough al Text." },
  ],
  snippet: `import { Heading } from "@/components";

<Heading level={1}>Servel</Heading>
<Heading level={2} color={c.success}>Enviado</Heading>`,
};

export default showcase;
