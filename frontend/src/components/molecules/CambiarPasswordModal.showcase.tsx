import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CambiarPasswordModal } from "./CambiarPasswordModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function CambiarPasswordDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Cambiar Password</Button>
      <CambiarPasswordModal
        visible={open}
        onCancel={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Formulario para cambiar password: current + new + confirm. Valida match en cliente.",
  variants: [{ label: "abrir demo", render: () => <CambiarPasswordDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onCancel", type: "() => void", required: true },
    { name: "onSubmit", type: "(current: string, next: string) => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { CambiarPasswordModal } from "@/components";

<CambiarPasswordModal
  visible={open}
  onCancel={() => setOpen(false)}
  onSubmit={(current, next) => mutation.mutate({ current, next })}
  loading={mutation.isPending}
/>`,
};

export default showcase;
