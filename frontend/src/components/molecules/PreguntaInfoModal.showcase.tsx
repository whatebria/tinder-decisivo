import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { PreguntaInfoModal } from "./PreguntaInfoModal";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function PreguntaInfoDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Pregunta Info</Button>
      <PreguntaInfoModal
        visible={open}
        onClose={() => setOpen(false)}
        pregunta={{
          texto: "El Estado deberia aumentar el gasto en salud publica financiado con mas impuestos.",
          eje_tematico_display: "Economia y salud",
          explicacion: "Esta pregunta explora tu vision sobre el rol del Estado en la provision de servicios de salud y la disposicion a financiarlo con impuestos.",
          repercusiones: {
            economico: "Mayor gasto publico requiere subir impuestos o reasignar recursos.",
            social: "Puede reducir desigualdades en acceso a salud.",
            institucional: "Fortalece FONASA vs sistema privado (ISAPRE).",
          },
        }}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Modal educativo con contexto de una pregunta: explicacion + repercusiones por dimension (economica, social, cultural, ambiental, institucional).",
  variants: [{ label: "abrir demo", render: () => <PreguntaInfoDemo /> }],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "pregunta", type: "{ texto, eje_tematico_display?, explicacion?, repercusiones? } | null", required: true },
  ],
  snippet: `import { PreguntaInfoModal } from "@/components";

<PreguntaInfoModal
  visible={showInfo}
  onClose={() => setShowInfo(false)}
  pregunta={preguntaActual}
/>`,
};

export default showcase;
