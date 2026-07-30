import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
// dependencia inversa components/ -> screens/design-system/.

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Divider } from "./Divider";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description: "Linea separadora hairline. Horizontal (default) o vertical.",
  variants: [
    {
      label: "horizontal",
      render: () => (
        <View style={{ width: 200 }}>
          <DemoText style={{ marginBottom: 8 }}>Arriba</DemoText>
          <Divider />
          <DemoText style={{ marginTop: 8 }}>Abajo</DemoText>
        </View>
      ),
    },
    {
      label: "vertical",
      render: () => (
        <View style={{ flexDirection: "row", height: 60, alignItems: "center", gap: 12 }}>
          <DemoText>Izq</DemoText>
          <Divider orientation="vertical" />
          <DemoText>Der</DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "orientation", type: "\"horizontal\" | \"vertical\"", defaultValue: "\"horizontal\"" },
  ],
  snippet: `import { Divider } from "@/components";

<Text>Seccion 1</Text>
<Divider />
<Text>Seccion 2</Text>`,
};

export default showcase;
