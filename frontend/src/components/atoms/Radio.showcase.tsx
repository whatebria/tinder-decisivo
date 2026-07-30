import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Radio } from "./Radio";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

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

const showcase: ShowcaseEntry = {
  description:
    "Control de seleccion unica. Uso tipico dentro de RadioGroup pero reusable standalone.",
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
  snippet: `import { Radio } from "@/components";

<Radio
  label="Muy de acuerdo"
  selected={value === "strongly_agree"}
  onPress={() => setValue("strongly_agree")}
/>`,
};

export default showcase;
