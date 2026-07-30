import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const ICON_NAMES: IconName[] = [
  "chevron-right", "chevron-left", "check", "close", "info", "alert", "clock",
  "user", "heart", "undo", "search", "plus", "mail", "link", "bell", "gear",
  "news", "columns", "home", "bookmark", "whatsapp", "twitter",
];

const showcase: ShowcaseEntry = {
  description:
    "Set curado de 23 iconos SVG (stroke 2, currentColor). Todos con viewBox 24x24.",
  variants: [
    {
      label: "grid completo (23 iconos)",
      render: () => (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {ICON_NAMES.map((n) => (
            <View key={n} style={{ alignItems: "center", width: 60 }}>
              <Icon name={n} size={24} />
            </View>
          ))}
        </View>
      ),
    },
    { label: "size custom", render: () => <Icon name="heart" size={48} /> },
    { label: "color custom", render: () => <Icon name="alert" size={32} color="#B85C5C" /> },
    { label: "fill (heart lleno)", render: () => <Icon name="heart" size={32} color="#B85C5C" fill="#B85C5C" /> },
  ],
  props: [
    { name: "name", type: "IconName", required: true, description: "Union de 23 nombres (ver Icon.tsx)." },
    { name: "size", type: "number", defaultValue: "20" },
    { name: "color", type: "string", defaultValue: "\"currentColor\"", description: "Color del stroke." },
    { name: "strokeWidth", type: "number", defaultValue: "2" },
    { name: "fill", type: "string", defaultValue: "\"none\"", description: "Fill del path (para heart 'lleno')." },
  ],
  snippet: `import { Icon } from "@/components";

<Icon name="heart" size={24} color="#B85C5C" />`,
};

export default showcase;
