import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ChipActivo } from "./ChipActivo";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Chip con boton X para representar un filtro activo. Se usa en barras de filtros aplicados (ej. 'Presidencial x', 'Nacional x').",
  variants: [
    {
      label: "filtros activos multiples",
      render: () => (
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <ChipActivo label="Presidencial" onRemove={() => {}} />
          <ChipActivo label="Region Metropolitana" onRemove={() => {}} />
          <ChipActivo label="Economia" onRemove={() => {}} />
        </View>
      ),
    },
    {
      label: "chip individual",
      render: () => <ChipActivo label="Frente Amplio" onRemove={() => {}} />,
    },
  ],
  props: [
    { name: "label", type: "string", required: true },
    { name: "onRemove", type: "() => void", required: true, description: "Handler del boton X. Se dispara con touch/tap/Enter." },
  ],
  snippet: `import { ChipActivo } from "@/components";

{activeFilters.map((f) => (
  <ChipActivo key={f.id} label={f.label} onRemove={() => removeFilter(f.id)} />
))}`,
};

export default showcase;
