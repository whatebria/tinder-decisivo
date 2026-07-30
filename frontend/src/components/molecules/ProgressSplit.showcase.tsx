import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ProgressSplit } from "./ProgressSplit";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Dos barras de progreso lado a lado. Proporcion configurable segun peso de cada segmento. Extras se apagan si total=0.",
  variants: [
    {
      label: "base + extras",
      render: () => (
        <View style={{ width: 260 }}>
          <ProgressSplit baseDone={8} baseTotal={12} extrasDone={2} extrasTotal={6} />
        </View>
      ),
    },
    {
      label: "sin extras (opaco)",
      render: () => (
        <View style={{ width: 260 }}>
          <ProgressSplit baseDone={5} baseTotal={12} extrasDone={0} extrasTotal={0} />
        </View>
      ),
    },
    {
      label: "labels custom",
      render: () => (
        <View style={{ width: 260 }}>
          <ProgressSplit
            baseDone={10}
            baseTotal={20}
            extrasDone={3}
            extrasTotal={5}
            baseLabel="Preguntas base"
            extrasLabel="Extras"
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "baseDone", type: "number", required: true },
    { name: "baseTotal", type: "number", required: true },
    { name: "extrasDone", type: "number", defaultValue: "0" },
    { name: "extrasTotal", type: "number", defaultValue: "0" },
    { name: "baseLabel", type: "string", description: "Default: 'Base (N)'." },
    { name: "extrasLabel", type: "string", description: "Default: 'Extras (N)'." },
  ],
  snippet: `import { ProgressSplit } from "@/components";

<ProgressSplit
  baseDone={respuestasBase}
  baseTotal={12}
  extrasDone={respuestasExtras}
  extrasTotal={preguntasExtras}
/>`,
};

export default showcase;
