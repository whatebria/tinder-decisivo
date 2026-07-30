import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ElectionsStrip } from "./ElectionsStrip";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Scroll horizontal de ElectionCards + cards dashed '+ Activar {tipo}' al final. Del Home HUB > Tus elecciones.",
  variants: [
    {
      label: "3 elecciones + add",
      render: () => (
        <View style={{ maxWidth: 600 }}>
          <ElectionsStrip
            elections={[
              { key: "pres", name: "Presidencial 2025", scope: "Nacional", isCompleted: true, matchPercent: 87, progressPercent: 100, variant: "active" },
              { key: "dip", name: "Diputados D8", scope: "D8", isCompleted: false, matchPercent: 62, progressPercent: 75 },
              { key: "cons", name: "Consejeros Regionales", scope: "RM", isCompleted: false, matchPercent: null, progressPercent: 40, pendingLabel: "6 preguntas extras pendientes" },
            ]}
            addOptions={[
              { key: "alcalde", label: "Alcalde", onPress: () => {} },
            ]}
          />
        </View>
      ),
    },
    {
      label: "solo elecciones",
      render: () => (
        <View style={{ maxWidth: 600 }}>
          <ElectionsStrip
            elections={[
              { key: "pres", name: "Presidencial 2025", isCompleted: true, matchPercent: 87, progressPercent: 100, variant: "active" },
            ]}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "elections", type: "Array<ElectionCardProps & { key }>", required: true, description: "Cada card hereda las props de ElectionCard." },
    { name: "addOptions", type: "Array<{ key, label, onPress? }>", defaultValue: "[]", description: "Cards dashed '+ Activar {label}' al final." },
  ],
  snippet: `import { ElectionsStrip } from "@/components";

<ElectionsStrip
  elections={misElecciones.map((e) => ({
    key: e.id,
    name: e.tipo,
    scope: e.scope,
    isCompleted: e.completado,
    matchPercent: e.matchPercent,
    progressPercent: e.progresoCuestionario,
    variant: e.id === selectedId ? "active" : undefined,
    onPress: () => setSelected(e.id),
  }))}
/>`,
};

export default showcase;
