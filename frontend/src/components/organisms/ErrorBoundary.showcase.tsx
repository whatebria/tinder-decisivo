import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ErrorBoundary } from "./ErrorBoundary";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Class component. Atrapa errores de render en el arbol. Muestra fallback con boton de reintento. NO atrapa errores en event handlers ni async (eso lo cubre useToast en cada catch).",
  variants: [
    {
      label: "sin error (renderiza children)",
      render: () => (
        <ErrorBoundary>
          <DemoText style={{ padding: 12 }}>Contenido normal renderizado dentro de ErrorBoundary.</DemoText>
        </ErrorBoundary>
      ),
    },
    {
      label: "nota",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            Para ver el fallback, tira un throw dentro de un componente hijo en dev.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Arbol a proteger." },
  ],
  snippet: `import { ErrorBoundary } from "@/components";

<ErrorBoundary>
  <AppNavigator />
</ErrorBoundary>`,
};

export default showcase;
