import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { NovedadesFeed } from "./NovedadesFeed";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Lista vertical de NovedadItems (feed del HUB: action, update).",
  variants: [
    {
      label: "2 items mixtos",
      render: () => (
        <View style={{ maxWidth: 500 }}>
          <NovedadesFeed
            items={[
              {
                key: "a1",
                kind: "action",
                icon: "alert",
                title: "Complete 3 preguntas mas",
                subtitle: "Para desbloquear tu match completo",
                ctaLabel: "Ir",
                onCta: () => {},
              },
              {
                key: "u1",
                kind: "update",
                avatarInitials: "GB",
                title: "Boric publico nueva postura sobre educacion",
                subtitle: "Ahora coincides 89%",
              },
            ]}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "items", type: "NovedadFeedItem[]", required: true, description: "Array de items con la misma shape que NovedadItem + key. Se determina por 'kind'." },
  ],
  snippet: `import { NovedadesFeed } from "@/components";

<NovedadesFeed items={novedades.map((n) => ({ key: n.id, ...n }))} />`,
};

export default showcase;
