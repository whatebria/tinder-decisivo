import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { SectionTitle } from "./SectionTitle";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Header de seccion. H2 (18px) o H3 (16px). Link 'Ver todos' opcional a la derecha.",
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
  snippet: `import { SectionTitle } from "@/components";

<SectionTitle
  title="Novedades"
  actionLabel="Ver todas"
  onAction={() => navigate("Novedades")}
/>`,
};

export default showcase;
