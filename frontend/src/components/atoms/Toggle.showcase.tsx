import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Toggle } from "./Toggle";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ToggleDemo() {
  const [value, setValue] = React.useState(true);
  return (
    <Toggle
      value={value}
      onPress={() => setValue(!value)}
      accessibilityLabel="Toggle demo"
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Switch on/off tipo pill. Alternativa a Checkbox para preferencias. accessibilityLabel obligatorio.",
  variants: [
    { label: "off", render: () => <Toggle value={false} onPress={() => {}} accessibilityLabel="Toggle off" /> },
    { label: "on", render: () => <Toggle value={true} onPress={() => {}} accessibilityLabel="Toggle on" /> },
    { label: "interactive", render: () => <ToggleDemo /> },
    { label: "disabled", render: () => <Toggle value={true} disabled onPress={() => {}} accessibilityLabel="Toggle disabled" /> },
  ],
  props: [
    { name: "value", type: "boolean", required: true },
    { name: "accessibilityLabel", type: "string", required: true },
    { name: "onPress", type: "() => void" },
    { name: "disabled", type: "boolean" },
  ],
  snippet: `import { Toggle } from "@/components";

<Toggle
  value={notifsEnabled}
  onPress={() => setNotifsEnabled(!notifsEnabled)}
  accessibilityLabel="Activar notificaciones"
/>`,
};

export default showcase;
