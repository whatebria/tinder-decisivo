import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ListPickerModal } from "./ListPickerModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const REGIONES_MOCK = [
  { id: 1, title: "Region Metropolitana", subtitle: "52 comunas" },
  { id: 2, title: "Valparaiso", subtitle: "38 comunas" },
  { id: 3, title: "Biobio", subtitle: "33 comunas" },
  { id: 4, title: "La Araucania", subtitle: "32 comunas" },
];

function ListPickerDemo({ searchable = false }: { searchable?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [sel, setSel] = React.useState<number | null>(1);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>
        Elegir region
      </Button>
      <ListPickerModal
        visible={open}
        title="Elige tu region"
        subtitle="Se usa para personalizar tus elecciones locales"
        items={REGIONES_MOCK}
        selectedId={sel}
        searchable={searchable}
        onSelect={(item) => {
          setSel(item.id);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Modal generico de seleccion single-choice sobre una lista. Con o sin search + loading + emptyText.",
  variants: [
    { label: "simple", render: () => <ListPickerDemo /> },
    { label: "con search", render: () => <ListPickerDemo searchable /> },
  ],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "title", type: "string", required: true },
    { name: "subtitle", type: "string" },
    { name: "items", type: "ListPickerItem[]", required: true, description: "{ id: number, title: string, subtitle?: string }" },
    { name: "selectedId", type: "number | null", required: true },
    { name: "searchable", type: "boolean", defaultValue: "false" },
    { name: "loading", type: "boolean", defaultValue: "false" },
    { name: "emptyText", type: "string", description: "Texto cuando no hay items." },
    { name: "onSelect", type: "(item: ListPickerItem) => void", required: true },
    { name: "onClose", type: "() => void", required: true },
  ],
  snippet: `import { ListPickerModal } from "@/components";

<ListPickerModal
  visible={open}
  title="Elige tu region"
  items={regiones.map((r) => ({ id: r.id, title: r.nombre, subtitle: r.n_comunas + ' comunas' }))}
  selectedId={regionActual}
  searchable
  onSelect={(item) => setRegion(item.id)}
  onClose={() => setOpen(false)}
/>`,
};

export default showcase;
