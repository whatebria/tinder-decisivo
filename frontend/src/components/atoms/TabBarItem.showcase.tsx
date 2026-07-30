import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { TabBarItem } from "./TabBarItem";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Item individual del BottomNav / Sidebar. Icon 24px + label 11px. Estado activo con bg tinted.",
  variants: [
    {
      label: "bottom / inactive",
      render: () => (
        <View style={{ width: 80 }}>
          <TabBarItem icon="home" label="Home" onPress={() => {}} />
        </View>
      ),
    },
    {
      label: "bottom / active",
      render: () => (
        <View style={{ width: 80 }}>
          <TabBarItem icon="home" label="Home" active onPress={() => {}} />
        </View>
      ),
    },
    {
      label: "side / active",
      render: () => (
        <View style={{ width: 80 }}>
          <TabBarItem icon="news" label="Noticias" active variant="side" onPress={() => {}} />
        </View>
      ),
    },
  ],
  props: [
    { name: "icon", type: "IconName", required: true },
    { name: "label", type: "string", required: true },
    { name: "active", type: "boolean", defaultValue: "false" },
    { name: "variant", type: "\"bottom\" | \"side\"", defaultValue: "\"bottom\"", description: "Bottom usa bg 8% primary, side usa 10%." },
    { name: "onPress", type: "() => void" },
  ],
  snippet: `import { TabBarItem } from "@/components";

<TabBarItem
  icon="home"
  label="Home"
  active={route === "home"}
  onPress={() => navigate("Home")}
/>`,
};

export default showcase;
