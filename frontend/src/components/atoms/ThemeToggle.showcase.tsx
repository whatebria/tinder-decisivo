import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ThemeToggle } from "./ThemeToggle";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Segmented control claro/oscuro/sistema. Persistente. Reactivo al tema actual.",
  variants: [
    { label: "default", render: () => <ThemeToggle /> },
  ],
  props: [
    { name: "hideLabel", type: "boolean", defaultValue: "false", description: "Reservado: oculta el label superior (aun no implementado en el render actual)." },
  ],
  snippet: `import { ThemeToggle } from "@/components";

<ThemeToggle />`,
};

export default showcase;
