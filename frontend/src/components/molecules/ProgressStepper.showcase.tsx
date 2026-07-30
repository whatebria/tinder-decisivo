import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ProgressStepper } from "./ProgressStepper";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Pasos numerados horizontales. Estados: done (verde), active (primary), pending (gris).",
  variants: [
    {
      label: "3 pasos, en el 2",
      render: () => (
        <View style={{ width: 400 }}>
          <ProgressStepper
            steps={[{ label: "Preguntas" }, { label: "Pesos" }, { label: "Resultados" }]}
            currentIndex={1}
          />
        </View>
      ),
    },
    {
      label: "todo done",
      render: () => (
        <View style={{ width: 400 }}>
          <ProgressStepper
            steps={[{ label: "Preguntas" }, { label: "Pesos" }, { label: "Resultados" }]}
            currentIndex={3}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "steps", type: "ReadonlyArray<{ label: string }>", required: true },
    { name: "currentIndex", type: "number", required: true, description: "0-based. Previos = done, siguientes = pending." },
  ],
  snippet: `import { ProgressStepper } from "@/components";

<ProgressStepper
  steps={[
    { label: "Preguntas" },
    { label: "Pesos" },
    { label: "Resultados" },
  ]}
  currentIndex={currentStep}
/>`,
};

export default showcase;
