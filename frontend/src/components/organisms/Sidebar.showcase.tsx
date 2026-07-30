import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Sidebar } from "./Sidebar";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const mockNav = { navigate: (r: string) => console.log("navigate:", r) };

const showcase: ShowcaseEntry = {
  description:
    "Barra de navegacion vertical (variante desktop / tablet landscape). Mismos 5 tabs que BottomNav. Se usa en AppShell cuando ancho >=900px.",
  variants: [
    { label: "active=home", render: () => <View style={{ height: 300, alignItems: "flex-start" }}><Sidebar active="home" navigation={mockNav} /></View> },
    { label: "active=comparar", render: () => <View style={{ height: 300, alignItems: "flex-start" }}><Sidebar active="comparar" navigation={mockNav} /></View> },
  ],
  props: [
    { name: "active", type: "AppTab | null", required: true },
    { name: "navigation", type: "AppTabNavigator", required: true },
  ],
  snippet: `import { Sidebar } from "@/components";

<Sidebar active="home" navigation={navigation} />`,
};

export default showcase;
