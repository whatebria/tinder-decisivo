import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Checkbox } from "./Checkbox";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(false);
  return <Checkbox label="Recuerdame en este dispositivo" checked={checked} onPress={() => setChecked(!checked)} />;
}

const showcase: ShowcaseEntry = {
  description:
    "Control de seleccion multiple / booleana. Tick vectorial (no depende de emojis).",
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
  snippet: `import { Checkbox } from "@/components";

<Checkbox
  label="Acepto los terminos y condiciones"
  checked={accepted}
  onPress={() => setAccepted(!accepted)}
/>`,
};

export default showcase;
