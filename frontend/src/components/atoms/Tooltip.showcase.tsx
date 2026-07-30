import { View } from "react-native";

// TODO(paso 6 cleanup): mover DemoText a components/ para eliminar esta
// dependencia inversa components/ -> screens/design-system/.
import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Tooltip } from "./Tooltip";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Bubble contextual que aparece en long-press (RN no tiene hover). Auto-oculta al soltar.",
  variants: [
    {
      label: "top (default)",
      render: () => (
        <View style={{ paddingTop: 48, alignItems: "flex-start" }}>
          <Tooltip tip="Este es un tooltip">
            <DemoText style={{ padding: 8 }}>Manten pulsado</DemoText>
          </Tooltip>
        </View>
      ),
    },
    {
      label: "visible controlado",
      render: () => (
        <View style={{ paddingTop: 56, alignItems: "flex-start" }}>
          <Tooltip tip="Estoy siempre visible" visible>
            <DemoText style={{ padding: 8 }}>Elemento</DemoText>
          </Tooltip>
        </View>
      ),
    },
    {
      label: "bottom position",
      render: () => (
        <View style={{ paddingBottom: 48, alignItems: "flex-start" }}>
          <Tooltip tip="Aparece abajo" visible position="bottom">
            <DemoText style={{ padding: 8 }}>Elemento</DemoText>
          </Tooltip>
        </View>
      ),
    },
  ],
  props: [
    { name: "tip", type: "string", required: true, description: "Texto del bubble." },
    { name: "children", type: "ReactNode", required: true, description: "Elemento sobre el que se muestra." },
    { name: "position", type: "\"top\" | \"bottom\"", defaultValue: "\"top\"" },
    { name: "visible", type: "boolean", description: "Modo controlado. Si no se pasa, se toggle en long-press." },
  ],
  snippet: `import { Tooltip } from "@/components";

<Tooltip tip="Esta accion es irreversible">
  <IconButton accessibilityLabel="Info"><Icon name="info" /></IconButton>
</Tooltip>`,
};

export default showcase;
