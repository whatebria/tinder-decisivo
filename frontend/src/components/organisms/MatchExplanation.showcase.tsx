import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { MatchExplanation } from "./MatchExplanation";

void MatchExplanation;

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Panel colapsable con desglose pregunta-a-pregunta del match. Fetchea data via useMatchDetalle lazy (solo al expandir).",
  variants: [
    {
      label: "no demoable aqui",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            Requiere QueryClient con API viva (usa useMatchDetalle). Ver en uso desde DetalleCandidatoScreen.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "candidatoId", type: "number | undefined", required: true, description: "Si undefined, no fetchea." },
  ],
  snippet: `import { MatchExplanation } from "@/components";

<MatchExplanation candidatoId={candidato.id} />`,
};

export default showcase;
