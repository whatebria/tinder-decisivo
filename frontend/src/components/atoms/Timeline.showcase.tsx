import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Timeline } from "./Timeline";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Trayectoria vertical con dots + linea. Estado 'past' atenua para eventos historicos.",
  variants: [
    {
      label: "trayectoria candidato",
      render: () => (
        <View style={{ width: 250 }}>
          <Timeline
            items={[
              { year: "2024 - Actual", desc: "Presidente de la Republica" },
              { year: "2018 - 2022", desc: "Diputado por Magallanes", past: true },
              { year: "2013 - 2018", desc: "Presidente Federacion Estudiantes", past: true },
            ]}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "items", type: "TimelineItem[]", required: true, description: "{ year, desc, past? }" },
  ],
  snippet: `import { Timeline } from "@/components";

<Timeline
  items={[
    { year: "2024 - Actual", desc: "Presidente" },
    { year: "2018 - 2022", desc: "Diputado", past: true },
  ]}
/>`,
};

export default showcase;
