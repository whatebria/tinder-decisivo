import React from "react";
import { Text, View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CollapsibleFilterSection } from "./CollapsibleFilterSection";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Seccion colapsable con titulo + summary del contenido. Ideal para agrupar filtros o bloques opcionales en formularios largos.",
  variants: [
    {
      label: "expandida por default",
      render: () => (
        <View style={{ width: 300 }}>
          <CollapsibleFilterSection
            title="Tipo de eleccion"
            summary="Presidencial, Senatorial"
            defaultExpanded
          >
            <Text>Aca van los checkboxes de tipos de eleccion.</Text>
          </CollapsibleFilterSection>
        </View>
      ),
    },
    {
      label: "colapsada",
      render: () => (
        <View style={{ width: 300 }}>
          <CollapsibleFilterSection title="Dimensiones" summary="Todas">
            <Text>Contenido oculto hasta expandir.</Text>
          </CollapsibleFilterSection>
        </View>
      ),
    },
  ],
  props: [
    { name: "title", type: "string", required: true },
    { name: "summary", type: "string", required: true, description: "Resumen visible cuando esta colapsada." },
    { name: "defaultExpanded", type: "boolean", defaultValue: "false" },
    { name: "children", type: "ReactNode", required: true },
  ],
  snippet: `import { CollapsibleFilterSection } from "@/components";

<CollapsibleFilterSection
  title="Dimensiones"
  summary={selectedDimensions.length + " seleccionadas"}
  defaultExpanded={hasActiveFilters}
>
  <DimensionCheckboxes />
</CollapsibleFilterSection>`,
};

export default showcase;
