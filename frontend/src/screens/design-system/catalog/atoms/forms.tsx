/**
 * Catalogo de atomos: FORMULARIOS.
 *
 * Incluye: Input, Radio, Checkbox.
 */

import React from "react";

import { Checkbox, Input, Radio } from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

function RadioDemo() {
  const [selected, setSelected] = React.useState<string>("a");
  return (
    <>
      <Radio label="Muy de acuerdo" selected={selected === "a"} onPress={() => setSelected("a")} />
      <Radio label="De acuerdo" selected={selected === "b"} onPress={() => setSelected("b")} />
      <Radio label="En desacuerdo" selected={selected === "c"} onPress={() => setSelected("c")} />
    </>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(false);
  return <Checkbox label="Recuerdame en este dispositivo" checked={checked} onPress={() => setChecked(!checked)} />;
}

function InputDemo() {
  const [v, setV] = React.useState("");
  return <Input value={v} onChangeText={setV} placeholder="Escribe algo..." />;
}

export const formsCatalog: CatalogEntry[] = [
  {
    name: "Input",
    path: "atoms/Input",
    category: "atoms",
    description: "TextInput con estilos WCAG-friendly (min-height 48, contraste borde). Soporta multiline (textarea).",
    variants: [
      { label: "default", render: () => <InputDemo /> },
      { label: "con valor", render: () => <Input value="valor@ejemplo.cl" onChangeText={() => {}} /> },
      { label: "con error", render: () => <Input value="valor invalido" hasError onChangeText={() => {}} /> },
      { label: "multiline", render: () => <Input value="Texto\nmultilinea..." multiline onChangeText={() => {}} /> },
    ],
    props: [
      { name: "value", type: "string", description: "Controlled." },
      { name: "onChangeText", type: "(text: string) => void" },
      { name: "placeholder", type: "string" },
      { name: "hasError", type: "boolean", defaultValue: "false", description: "Cambia el border a danger." },
      { name: "multiline", type: "boolean", defaultValue: "false", description: "Modo textarea (min-height 96)." },
      { name: "...TextInputProps", type: "-", description: "Hereda toda la API de TextInput (secureTextEntry, keyboardType, etc.)." },
    ],
    snippet: `import { Input } from "../components";

<Input
  value={email}
  onChangeText={setEmail}
  placeholder="tu@correo.cl"
  keyboardType="email-address"
  autoCapitalize="none"
/>`,
  },
  {
    name: "Radio",
    path: "atoms/Radio",
    category: "atoms",
    description: "Control de seleccion unica. Uso tipico dentro de RadioGroup pero reusable standalone.",
    variants: [
      { label: "grupo interactivo", render: () => <RadioDemo /> },
      { label: "seleccionado", render: () => <Radio label="Opcion elegida" selected onPress={() => {}} /> },
      { label: "no seleccionado", render: () => <Radio label="Opcion disponible" selected={false} onPress={() => {}} /> },
      { label: "disabled", render: () => <Radio label="No disponible" selected={false} disabled onPress={() => {}} /> },
    ],
    props: [
      { name: "label", type: "string", required: true },
      { name: "selected", type: "boolean", required: true },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { Radio } from "../components";

<Radio
  label="Muy de acuerdo"
  selected={value === "strongly_agree"}
  onPress={() => setValue("strongly_agree")}
/>`,
  },
  {
    name: "Checkbox",
    path: "atoms/Checkbox",
    category: "atoms",
    description: "Control de seleccion multiple / booleana. Tick vectorial (no depende de emojis).",
    variants: [
      { label: "interactive", render: () => <CheckboxDemo /> },
      { label: "checked", render: () => <Checkbox label="Acepto los terminos" checked onPress={() => {}} /> },
      { label: "unchecked", render: () => <Checkbox label="Suscribirme al newsletter" checked={false} onPress={() => {}} /> },
      { label: "disabled", render: () => <Checkbox label="No disponible" checked disabled onPress={() => {}} /> },
    ],
    props: [
      { name: "label", type: "string", required: true },
      { name: "checked", type: "boolean", required: true },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { Checkbox } from "../components";

<Checkbox
  label="Acepto los terminos y condiciones"
  checked={accepted}
  onPress={() => setAccepted(!accepted)}
/>`,
  },
];
