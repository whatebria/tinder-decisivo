import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CandidatoPickerModal } from "./CandidatoPickerModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const CANDIDATOS_MOCK = [
  { id: 1, nombre: "Gabriel", apellido: "Boric", partido_nombre: "Frente Amplio", partido_sigla: "FA" },
  { id: 2, nombre: "Jose Antonio", apellido: "Kast", partido_nombre: "Republicano", partido_sigla: "PR" },
  { id: 3, nombre: "Yasna", apellido: "Provoste", partido_nombre: "DC", partido_sigla: "DC" },
] as const;

function CandidatoPickerDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Elegir candidato</Button>
      <CandidatoPickerModal
        visible={open}
        title="Comparar con..."
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidatos={CANDIDATOS_MOCK as any}
        excluirId={1}
        onSelect={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Modal para seleccionar un candidato de una lista (ej. para comparar posturas). Excluye opcionalmente uno via excluirId.",
  variants: [{ label: "abrir picker", render: () => <CandidatoPickerDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "title", type: "string", defaultValue: "\"Elegir candidato\"" },
    { name: "candidatos", type: "Candidato[]", required: true },
    { name: "excluirId", type: "number | null", description: "Si se pasa, ese candidato no aparece en la lista." },
    { name: "onSelect", type: "(candidato: Candidato) => void", required: true },
    { name: "onClose", type: "() => void", required: true },
  ],
  snippet: `import { CandidatoPickerModal } from "@/components";

<CandidatoPickerModal
  visible={pickerOpen}
  candidatos={candidatosDelTipo}
  excluirId={candidatoActual.id}
  onSelect={(c) => compararCon(c)}
  onClose={() => setPickerOpen(false)}
/>`,
};

export default showcase;
