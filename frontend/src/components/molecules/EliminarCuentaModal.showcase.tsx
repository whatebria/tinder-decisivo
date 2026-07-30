import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { EliminarCuentaModal } from "./EliminarCuentaModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function EliminarCuentaDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="danger" onPress={() => setOpen(true)} fullWidth={false}>Abrir Eliminar Cuenta</Button>
      <EliminarCuentaModal
        visible={open}
        onCancel={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Doble confirmacion destructiva: requiere password + escribir 'ELIMINAR' (uppercase) para habilitar el boton.",
  variants: [{ label: "abrir demo", render: () => <EliminarCuentaDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onCancel", type: "() => void", required: true },
    { name: "onSubmit", type: "(password: string) => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { EliminarCuentaModal } from "@/components";

<EliminarCuentaModal
  visible={open}
  onCancel={() => setOpen(false)}
  onSubmit={(pwd) => deleteAccount(pwd)}
  loading={mutation.isPending}
/>`,
};

export default showcase;
