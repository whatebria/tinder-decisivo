import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Input } from "./Input";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function InputDemo() {
  const [value, setValue] = React.useState("");
  return <Input value={value} onChangeText={setValue} placeholder="Escribe algo..." />;
}

const showcase: ShowcaseEntry = {
  description:
    "TextInput con estilos WCAG-friendly (min-height 48, contraste borde). Soporta multiline (textarea).",
  variants: [
    { label: "default", render: () => <InputDemo /> },
    { label: "con valor", render: () => <Input value="valor@ejemplo.cl" onChangeText={() => {}} /> },
    { label: "con error", render: () => <Input value="valor invalido" hasError onChangeText={() => {}} /> },
    { label: "multiline", render: () => <Input value={"Texto\nmultilinea..."} multiline onChangeText={() => {}} /> },
  ],
  props: [
    { name: "value", type: "string", description: "Controlled." },
    { name: "onChangeText", type: "(text: string) => void" },
    { name: "placeholder", type: "string" },
    { name: "hasError", type: "boolean", defaultValue: "false", description: "Cambia el border a danger." },
    { name: "multiline", type: "boolean", defaultValue: "false", description: "Modo textarea (min-height 96)." },
    { name: "...TextInputProps", type: "-", description: "Hereda toda la API de TextInput (secureTextEntry, keyboardType, etc.)." },
  ],
  snippet: `import { Input } from "@/components";

<Input
  value={email}
  onChangeText={setEmail}
  placeholder="tu@correo.cl"
  keyboardType="email-address"
  autoCapitalize="none"
/>`,
};

export default showcase;
