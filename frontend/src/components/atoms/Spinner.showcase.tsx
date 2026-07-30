import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Spinner } from "./Spinner";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "ActivityIndicator con color del design system. 3 variantes de color, cualquier size.",
  variants: [
    { label: "primary / small", render: () => <Spinner /> },
    { label: "primary / large", render: () => <Spinner size="large" /> },
    { label: "secondary", render: () => <Spinner variant="secondary" size="large" /> },
    {
      label: "onPrimary (sobre bg color)",
      render: () => (
        <View style={{ padding: 8, backgroundColor: "#2E5F7E", borderRadius: 8 }}>
          <Spinner variant="onPrimary" />
        </View>
      ),
    },
  ],
  props: [
    { name: "variant", type: "\"primary\" | \"secondary\" | \"onPrimary\"", defaultValue: "\"primary\"" },
    { name: "size", type: "\"small\" | \"large\" | number", defaultValue: "\"small\"" },
    { name: "...ActivityIndicatorProps", type: "-", description: "Hereda API de ActivityIndicator." },
  ],
  snippet: `import { Spinner } from "@/components";

{loading ? <Spinner size="large" /> : <Content />}`,
};

export default showcase;
