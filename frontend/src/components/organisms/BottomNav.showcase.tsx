import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { BottomNav } from "./BottomNav";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

// Mock navigator: en el showcase solo logueamos, no navegamos.
const mockNav = { navigate: (r: string) => console.log("navigate:", r) };

const showcase: ShowcaseEntry = {
  description:
    "Bottom nav de 5 tabs (variante mobile). Se usa en AppShell cuando el ancho <900px. Tabs: home, guardados, comparar, noticias, config.",
  variants: [
    { label: "active=home", render: () => <View style={{ width: "100%" }}><BottomNav active="home" navigation={mockNav} /></View> },
    { label: "active=noticias", render: () => <View style={{ width: "100%" }}><BottomNav active="noticias" navigation={mockNav} /></View> },
    { label: "active=null (polimorfica)", render: () => <View style={{ width: "100%" }}><BottomNav active={null} navigation={mockNav} /></View> },
  ],
  props: [
    { name: "active", type: "AppTab | null", required: true, description: "'home' | 'guardados' | 'comparar' | 'noticias' | 'config'. Null = pantalla polimorfica." },
    { name: "navigation", type: "AppTabNavigator", required: true, description: "{ navigate: (routeName: string) => void }" },
  ],
  snippet: `import { BottomNav } from "@/components";

<BottomNav active="home" navigation={navigation} />`,
};

export default showcase;
