import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ShareModal } from "./ShareModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ShareModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Share</Button>
      <ShareModal
        visible={open}
        text="Mira mi match electoral 2025: coincido 87% con el candidato X. Averigua el tuyo en tinder-decisivo.cl"
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Preview del texto a compartir + botones copiar/share nativo. Fallback a copy-only en desktop.",
  variants: [{ label: "abrir demo", render: () => <ShareModalDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "text", type: "string", required: true, description: "Texto a compartir." },
    { name: "onClose", type: "() => void", required: true },
  ],
  snippet: `import { ShareModal } from "@/components";

<ShareModal
  visible={open}
  text={\`Mira mi match: coincido 87% con X\`}
  onClose={() => setOpen(false)}
/>`,
};

export default showcase;
