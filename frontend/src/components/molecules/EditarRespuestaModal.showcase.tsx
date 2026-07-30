import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { EditarRespuestaModal } from "./EditarRespuestaModal";

// Import Type-only para evitar el warning de "unused". El componente lo
// referenciamos en el snippet, pero en runtime el modal se abre desde el
// contexto real (MisRespuestasScreen). Aca solo documentamos.
void EditarRespuestaModal;

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Modal para editar opcion + peso de una respuesta guardada. Muestra aviso de que recalcula el match.",
  variants: [
    {
      label: "no demoable aqui",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            Requiere un objeto MiRespuesta real del API. Ver EditarRespuestaModal en uso desde MisRespuestasScreen.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "respuesta", type: "MiRespuesta | null", required: true, description: "Tipo del API. { opcion_elegida, peso, pregunta_texto, ... }" },
    { name: "onCancel", type: "() => void", required: true },
    { name: "onSubmit", type: "(opcionId: number, peso: number) => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { EditarRespuestaModal } from "@/components";

<EditarRespuestaModal
  visible={editingId !== null}
  respuesta={misRespuestas.find((r) => r.id === editingId) ?? null}
  onCancel={() => setEditingId(null)}
  onSubmit={(opcionId, peso) => mutation.mutate({ id: editingId, opcionId, peso })}
  loading={mutation.isPending}
/>`,
};

export default showcase;
