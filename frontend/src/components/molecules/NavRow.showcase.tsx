import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { NavRow } from "./NavRow";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Box tap-able con label + subtitulo opcional y chevron a la derecha. Es el patron dominante de las pantallas de configuracion. Variante 'danger' para acciones destructivas (borrar cuenta, resetear cuestionario).",
  variants: [
    {
      label: "default (solo label)",
      render: () => (
        <View style={{ width: 300 }}>
          <NavRow label="Ubicacion electoral" onPress={() => {}} />
        </View>
      ),
    },
    {
      label: "con subtitulo",
      render: () => (
        <View style={{ width: 300 }}>
          <NavRow
            label="Cuestionario base"
            subtitle="12 base * 4 extras * editable"
            onPress={() => {}}
          />
        </View>
      ),
    },
    {
      label: "danger",
      render: () => (
        <View style={{ width: 300 }}>
          <NavRow label="Borrar mi cuenta" variant="danger" onPress={() => {}} />
        </View>
      ),
    },
    {
      label: "danger con subtitulo",
      render: () => (
        <View style={{ width: 300 }}>
          <NavRow
            label="Reiniciar cuestionario"
            subtitle="Esta accion no se puede deshacer"
            variant="danger"
            onPress={() => {}}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "label", type: "string", required: true },
    { name: "subtitle", type: "string", description: "Texto secundario debajo del label." },
    { name: "variant", type: "\"default\" | \"danger\"", defaultValue: "\"default\"" },
    { name: "accessibilityLabel", type: "string", description: "Sobrescribe el label como accessibilityLabel si necesitas mas contexto." },
    { name: "onPress", type: "() => void" },
  ],
  snippet: `import { NavRow } from "@/components";

<NavRow
  label="Ubicacion electoral"
  subtitle="Comuna: Providencia"
  onPress={() => navigate("Ubicacion")}
/>`,
};

export default showcase;
