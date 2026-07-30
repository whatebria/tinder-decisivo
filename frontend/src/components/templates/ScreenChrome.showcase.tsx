import { ScrollView, View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ScreenChrome } from "./ScreenChrome";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Wrapper minimalista para screens que NO usan AppShell (Cuestionario, DetalleCandidato). Aplica safe-area top y background del theme. NO aplica padding horizontal (responsabilidad del content container). Usar cuando la screen es full-focus o polimorfica sin nav lateral/inferior.",
  variants: [
    {
      label: "chrome minimo",
      render: () => (
        <View style={{ height: 200, borderWidth: 1, borderColor: "#ccc" }}>
          <ScreenChrome>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }}>
              <DemoText style={{ fontSize: 18, fontWeight: "700" }}>Screen sin AppShell</DemoText>
              <DemoText tone="secondary" style={{ fontSize: 13 }}>
                Este wrapper aplica safe-area top y bg del theme. El padding sp4 lo pone el content container del ScrollView, igual que en las screens con AppShell.
              </DemoText>
            </ScrollView>
          </ScreenChrome>
        </View>
      ),
    },
  ],
  props: [
    { name: "children", type: "ReactNode", required: true },
    { name: "edges", type: "Edge[]", defaultValue: "[\"top\"]", description: "Safe-area edges a respetar. Agregar 'bottom' si la screen no tiene BottomNav propia." },
    { name: "bg", type: "string", description: "Override del backgroundColor. Default: theme.bg" },
  ],
  snippet: `import { ScreenChrome } from "@/components";

// Screens sin AppShell (full-focus, detail, pre-auth):
export function CuestionarioScreen({ navigation }) {
  return (
    <ScreenChrome>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <ScreenTopBar title="Cuestionario" onBack={goBack} />
        {/* ... */}
      </ScrollView>
    </ScreenChrome>
  );
}`,
};

export default showcase;
