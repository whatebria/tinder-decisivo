import React from "react";
import { View } from "react-native";

// TODO(step 6): DemoText es una util del design-system screen. Considerar mover a `showcase/`.
import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { UbicacionPicker } from "./UbicacionPicker";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function UbicacionPickerDemo() {
  const [comuna, setComuna] = React.useState<{ id: number; nombre: string } | null>(null);
  return (
    <View style={{ width: 320 }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <UbicacionPicker value={comuna as any} onChange={(c) => setComuna(c as any)} />
      <DemoText tone="secondary" style={{ marginTop: 8, fontSize: 12 }}>
        Comuna seleccionada: {comuna ? comuna.nombre : "(ninguna)"}
      </DemoText>
    </View>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Composicion de region + comuna picker. Selecciona una comuna con contexto regional. Requiere data del API — el demo usa mock local. Emite un objeto `ComunaInline` con { id, nombre }.",
  variants: [{ label: "interactive", render: () => <UbicacionPickerDemo /> }],
  props: [
    { name: "value", type: "ComunaInline | null", required: true, description: "Comuna seleccionada actual." },
    { name: "onChange", type: "(comuna: ComunaInline | null) => void", required: true },
    { name: "disabled", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { UbicacionPicker } from "@/components";

<UbicacionPicker
  value={user.comuna}
  onChange={(c) => updateProfile({ comuna_id: c?.id ?? null })}
/>`,
};

export default showcase;
