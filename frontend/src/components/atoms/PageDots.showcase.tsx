import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { PageDots } from "./PageDots";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Indicador de posicion multi-paso. Dot activo se expande a pill. Pasos hechos van en verde.",
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
  snippet: `import { PageDots } from "@/components";

<PageDots total={5} current={activeSlide} />`,
};

export default showcase;
