import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { HomeGreeting } from "./HomeGreeting";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "H1 saludo + subtitulo con posible enfasis en un valor (segmento primary).",
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
    { name: "subtitleBefore", type: "string", description: "Prefijo del subtitulo con enfasis." },
    { name: "emphasized", type: "string", description: "Segmento destacado en color primary." },
    { name: "subtitleAfter", type: "string", description: "Sufijo del subtitulo con enfasis." },
  ],
  snippet: `import { HomeGreeting } from "@/components";

<HomeGreeting
  title={\`Buenos dias, \${user.nombre}\`}
  subtitleBefore="Faltan "
  emphasized={\`\${diasFaltan} dias\`}
  subtitleAfter=" para las presidenciales"
/>`,
};

export default showcase;
