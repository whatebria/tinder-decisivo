import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Badge } from "./Badge";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Chip compacto para status. 5 variantes semanticas con contraste WCAG AA verificado.",
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
  snippet: `import { Badge } from "@/components";

<Badge variant="success">Alta confianza</Badge>`,
};

export default showcase;
