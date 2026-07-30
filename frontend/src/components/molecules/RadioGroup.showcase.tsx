import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { RadioGroup } from "./RadioGroup";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function RadioGroupDemo() {
  const [v, setV] = React.useState<string | null>(null);
  return (
    <RadioGroup
      value={v}
      onChange={setV}
      options={[
        { value: "strongly_agree", label: "Muy de acuerdo" },
        { value: "agree", label: "De acuerdo" },
        { value: "neutral", label: "Neutral" },
        { value: "disagree", label: "En desacuerdo" },
        { value: "strongly_disagree", label: "Muy en desacuerdo" },
      ]}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Grupo de opciones de seleccion unica con opciones grandes. Ideal para el cuestionario Likert.",
  variants: [
    { label: "5 opciones Likert", render: () => <RadioGroupDemo /> },
  ],
  props: [
    { name: "options", type: "ReadonlyArray<RadioOption<T>>", required: true, description: "{ value, label, disabled? }" },
    { name: "value", type: "T | null", required: true },
    { name: "onChange", type: "(v: T) => void", required: true },
    { name: "accessibilityLabel", type: "string", description: "Label del grupo entero." },
  ],
  snippet: `import { RadioGroup } from "@/components";

<RadioGroup
  value={selected}
  onChange={setSelected}
  options={[
    { value: "strongly_agree", label: "Muy de acuerdo" },
    { value: "neutral", label: "Neutral" },
    { value: "strongly_disagree", label: "Muy en desacuerdo" },
  ]}
/>`,
};

export default showcase;
