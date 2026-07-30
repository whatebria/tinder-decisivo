import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { MatchTier } from "./MatchTier";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Badge de nivel de match usuario-candidato. Alto (>=70%) verde, medio (40-69%) info, bajo (<40%) warning.",
  variants: [
    { label: "high (87%)", render: () => <MatchTier percent={87} /> },
    { label: "mid (55%)", render: () => <MatchTier percent={55} /> },
    { label: "low (28%)", render: () => <MatchTier percent={28} /> },
    { label: "tier explicito sin %", render: () => <MatchTier tier="high" /> },
    { label: "label custom", render: () => <MatchTier tier="mid" label="Coincidencia parcial" /> },
  ],
  props: [
    { name: "percent", type: "number", description: "0-100. Si se pasa, calcula el tier automaticamente." },
    { name: "tier", type: "\"high\" | \"mid\" | \"low\"", description: "Sobrescribe el calculado por percent." },
    { name: "label", type: "string", description: "Default: 'Match alto/medio/bajo - X%'." },
    { name: "showPercent", type: "boolean", description: "Default: true cuando hay percent." },
  ],
  snippet: `import { MatchTier } from "@/components";

<MatchTier percent={candidato.matchPercent} />`,
};

export default showcase;
