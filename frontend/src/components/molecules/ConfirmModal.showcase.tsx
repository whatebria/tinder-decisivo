import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ConfirmModal } from "./ConfirmModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ConfirmModalDemo({ variant }: { variant: "danger" | "primary" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} variant={variant === "danger" ? "danger" : "primary"} fullWidth={false}>
        {`Abrir Confirm (${variant})`}
      </Button>
      <ConfirmModal
        visible={open}
        title={variant === "danger" ? "Eliminar cuenta" : "Guardar cambios"}
        message={variant === "danger" ? "Esta accion no se puede deshacer. Se borran todos tus datos." : "Se guardaran los cambios y se recalculara tu match."}
        confirmLabel={variant === "danger" ? "Si, eliminar" : "Guardar"}
        variant={variant}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Modal generico de confirmacion. 2 variantes (danger, primary). Loading opcional.",
  variants: [
    { label: "primary", render: () => <ConfirmModalDemo variant="primary" /> },
    { label: "danger", render: () => <ConfirmModalDemo variant="danger" /> },
  ],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "title", type: "string", required: true },
    { name: "message", type: "string", required: true },
    { name: "confirmLabel", type: "string", defaultValue: "\"Confirmar\"" },
    { name: "cancelLabel", type: "string", defaultValue: "\"Cancelar\"" },
    { name: "variant", type: "\"danger\" | \"primary\"", defaultValue: "\"primary\"" },
    { name: "onConfirm", type: "() => void", required: true },
    { name: "onCancel", type: "() => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { ConfirmModal } from "@/components";

<ConfirmModal
  visible={open}
  title="Eliminar postura"
  message="Se quitara de tus guardados. Puedes volver a agregarla despues."
  variant="danger"
  confirmLabel="Si, eliminar"
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
  loading={mutation.isPending}
/>`,
};

export default showcase;
