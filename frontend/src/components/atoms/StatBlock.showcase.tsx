import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { StatBlock } from "./StatBlock";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Metrica destacada: numero grande + label chico. 4 variantes de color. Delta opcional.",
  variants: [
    { label: "default", render: () => <StatBlock value={128} label="Noticias" /> },
    { label: "primary", render: () => <StatBlock value="85%" label="Match" variant="primary" /> },
    { label: "success", render: () => <StatBlock value={12} label="Guardados" variant="success" /> },
    { label: "warning + delta", render: () => <StatBlock value={3} label="Alertas" variant="warning" delta="+2 esta semana" /> },
  ],
  props: [
    { name: "value", type: "string | number", required: true },
    { name: "label", type: "string", required: true },
    { name: "variant", type: "\"default\" | \"primary\" | \"success\" | \"warning\"", defaultValue: "\"default\"" },
    { name: "delta", type: "string", description: "Texto pequeno debajo (ej: '+3 vs mes anterior')." },
  ],
  snippet: `import { StatBlock } from "@/components";

<StatBlock value="87%" label="Coincidencia" variant="primary" />`,
};

export default showcase;
