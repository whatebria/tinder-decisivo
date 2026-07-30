import React from "react";

import { Button } from "../atoms/Button";
import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Modal } from "./Modal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Modal base</Button>
      <Modal
        visible={open}
        onClose={() => setOpen(false)}
        title="Titulo del modal"
        footer={
          <>
            <Button variant="ghost" onPress={() => setOpen(false)} fullWidth={false}>Cancelar</Button>
            <Button onPress={() => setOpen(false)} fullWidth={false}>Aceptar</Button>
          </>
        }
      >
        <DemoText style={{ fontSize: 14 }}>
          Este es el body del modal. Puede contener cualquier contenido: texto, forms, listas...
        </DemoText>
      </Modal>
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Dialog base reusable. Header (title + close) + body scrollable + footer. Backdrop tap-para-cerrar.",
  variants: [{ label: "abrir demo", render: () => <ModalDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "title", type: "string", description: "Si se omite, no se renderiza header." },
    { name: "children", type: "ReactNode", required: true, description: "Body scrollable." },
    { name: "footer", type: "ReactNode", description: "Botones del footer." },
    { name: "maxWidth", type: "number", defaultValue: "480" },
    { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true" },
  ],
  snippet: `import { Modal, Button } from "@/components";

<Modal
  visible={open}
  onClose={() => setOpen(false)}
  title="Editar perfil"
  footer={<Button onPress={handleSave}>Guardar</Button>}
>
  <Text>Contenido...</Text>
</Modal>`,
};

export default showcase;
