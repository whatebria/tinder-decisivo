import React from "react";
import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Chip } from "./Chip";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ChipDemo() {
  const [selected, setSelected] = React.useState("todos");
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      {["todos", "positivos", "neutrales"].map((k) => (
        <Chip key={k} active={selected === k} onPress={() => setSelected(k)}>
          {k}
        </Chip>
      ))}
    </View>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Pill grande para filtros o tags. Pressable opcional. accessibilityState=selected cuando active.",
  variants: [
    { label: "default (no interactivo)", render: () => <Chip>Educacion</Chip> },
    { label: "interactive", render: () => <ChipDemo /> },
    { label: "active", render: () => <Chip active onPress={() => {}}>Seleccionado</Chip> },
    { label: "inactive", render: () => <Chip onPress={() => {}}>Sin seleccionar</Chip> },
  ],
  props: [
    { name: "children", type: "string", required: true },
    { name: "active", type: "boolean", defaultValue: "false" },
    { name: "onPress", type: "() => void", description: "Si no se pasa, renderiza como View no interactivo." },
  ],
  snippet: `import { Chip } from "@/components";

<Chip active={filter === "presidencial"} onPress={() => setFilter("presidencial")}>
  Presidencial
</Chip>`,
};

export default showcase;
