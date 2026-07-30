import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import type { Weight } from "./WeightSelector";
import { WeightSelector } from "./WeightSelector";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function WeightSelectorDemo() {
  const [w, setW] = React.useState<Weight | null>(null);
  return <WeightSelector value={w} onChange={setW} />;
}

const showcase: ShowcaseEntry = {
  description:
    "5 pills para elegir peso de una pregunta (1-5). Labels default: Nada/Poco/Medio/Alto/Mucho.",
  variants: [
    { label: "interactive", render: () => <WeightSelectorDemo /> },
    { label: "seleccionado en 4", render: () => <WeightSelector value={4} onChange={() => {}} /> },
    {
      label: "labels custom",
      render: () => (
        <WeightSelector
          value={3}
          onChange={() => {}}
          labels={{ 1: "No", 2: "Bajo", 3: "OK", 4: "Alto", 5: "Full" }}
        />
      ),
    },
  ],
  props: [
    { name: "value", type: "Weight | null", required: true, description: "1 | 2 | 3 | 4 | 5" },
    { name: "onChange", type: "(w: Weight) => void", required: true },
    { name: "labels", type: "Record<Weight, string>", description: "Default: Nada/Poco/Medio/Alto/Mucho." },
  ],
  snippet: `import { WeightSelector } from "@/components";

<WeightSelector value={peso} onChange={setPeso} />`,
};

export default showcase;
