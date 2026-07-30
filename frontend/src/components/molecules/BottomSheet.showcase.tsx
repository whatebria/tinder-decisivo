import React from "react";
import { Text } from "react-native";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { BottomSheet } from "./BottomSheet";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function BottomSheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Bottom Sheet</Button>
      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Titulo del sheet"
        footer={<Button onPress={() => setOpen(false)}>Cerrar</Button>}
      >
        <Text>Contenido del bottom sheet. Se desliza desde abajo en mobile.</Text>
      </BottomSheet>
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Modal presentado desde el borde inferior (mobile-first). Igual API que Modal pero con animacion slide-up. Ideal para acciones contextuales, filtros o previews.",
  variants: [{ label: "abrir demo", render: () => <BottomSheetDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "title", type: "string" },
    { name: "titleTrailing", type: "ReactNode", description: "Elemento a la derecha del titulo (ej. bookmark toggle)." },
    { name: "children", type: "ReactNode", required: true, description: "Body scrollable." },
    { name: "footer", type: "ReactNode" },
    { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true" },
  ],
  snippet: `import { BottomSheet } from "@/components";

<BottomSheet
  visible={open}
  onClose={() => setOpen(false)}
  title="Filtros"
>
  <FilterList />
</BottomSheet>`,
};

export default showcase;
