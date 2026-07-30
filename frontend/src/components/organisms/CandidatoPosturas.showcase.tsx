import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CandidatoPosturas } from "./CandidatoPosturas";

void CandidatoPosturas;

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Seccion de posturas de un candidato agrupadas por eje tematico. Coloreadas por valor Likert (verde acuerdo, rojo desacuerdo, gris neutral). Extrae URL de justificacion.",
  variants: [
    {
      label: "no demoable aqui",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            Requiere PosturaCandidatoDetalle[] del API. Ver en uso desde DetalleCandidatoScreen.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "posturas", type: "PosturaCandidatoDetalle[]", required: true, description: "Del API. { pregunta, valor_likert, justificacion, eje_tematico, ... }" },
    { name: "loading", type: "boolean" },
  ],
  snippet: `import { CandidatoPosturas } from "@/components";

const { data, isLoading } = useCandidato(id);
<CandidatoPosturas posturas={data?.posturas ?? []} loading={isLoading} />`,
};

export default showcase;
