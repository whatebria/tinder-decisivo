import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { DimensionBadge } from "./DimensionBadge";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Chip circular con el icono de una dimension tematica del dominio (economico, social, cultural, ambiental, institucional). Color de fondo desde src/domain/dimensiones.ts, texto blanco con contraste WCAG AA verificado. Reactivo NO al theme (el color de dominio es invariante) pero el texto blanco cumple AA en ambos modos.",
  variants: [
    {
      label: "tamano md (default) - todas las dimensiones",
      render: () => (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <DimensionBadge dimension="economico" />
          <DimensionBadge dimension="social" />
          <DimensionBadge dimension="cultural" />
          <DimensionBadge dimension="ambiental" />
          <DimensionBadge dimension="institucional" />
        </View>
      ),
    },
    {
      label: "tamano sm (18x18) - chip inline",
      render: () => (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <DimensionBadge dimension="economico" size="sm" />
          <DimensionBadge dimension="institucional" size="sm" />
        </View>
      ),
    },
    {
      label: "tamano lg (32x32) - header prominente",
      render: () => (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <DimensionBadge dimension="ambiental" size="lg" />
          <DimensionBadge dimension="cultural" size="lg" />
        </View>
      ),
    },
  ],
  props: [
    { name: "dimension", type: "\"economico\" | \"social\" | \"cultural\" | \"ambiental\" | \"institucional\"", required: true },
    { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"" },
    { name: "style", type: "ViewStyle", description: "Solo para posicionar." },
  ],
  snippet: `import { DimensionBadge } from "@/components";

<DimensionBadge dimension="institucional" size="md" />`,
};

export default showcase;
