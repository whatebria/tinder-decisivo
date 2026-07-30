import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { SentimentBadge } from "./SentimentBadge";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Indicador de tono de noticia. Puntito de color + label. NO depende solo del color (a11y).",
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
  snippet: `import { SentimentBadge } from "@/components";

<SentimentBadge sentiment="positive" />`,
};

export default showcase;
