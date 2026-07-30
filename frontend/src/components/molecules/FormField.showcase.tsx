import React from "react";
import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { FormField } from "./FormField";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function FormFieldDemo() {
  const [v, setV] = React.useState("");
  return (
    <View style={{ width: "100%" }}>
      <FormField
        label="Correo electronico"
        value={v}
        onChangeText={setV}
        placeholder="tu@correo.cl"
        helper="Se usa para recuperar tu cuenta."
      />
    </View>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Label + Input + helper (o error). Se anuncia como bloque unico a screen readers.",
  variants: [
    { label: "con helper", render: () => <FormFieldDemo /> },
    {
      label: "con error",
      render: () => (
        <View style={{ width: "100%" }}>
          <FormField
            label="Correo"
            value="valor invalido"
            onChangeText={() => {}}
            error="El correo debe tener formato tu@dominio.cl"
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "label", type: "string", required: true },
    { name: "helper", type: "string", description: "Texto de ayuda debajo del input." },
    { name: "error", type: "string", description: "Si esta presente, el Input se muestra en danger y oculta helper." },
    { name: "...InputProps", type: "-", description: "Hereda todas las props de Input (excepto hasError, que se calcula)." },
  ],
  snippet: `import { FormField } from "@/components";

<FormField
  label="Correo electronico"
  value={email}
  onChangeText={setEmail}
  placeholder="tu@correo.cl"
  error={errors.email}
  keyboardType="email-address"
/>`,
};

export default showcase;
