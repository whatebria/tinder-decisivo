import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { RankingCard } from "./RankingCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const ejeScoresMock = {
  ECONOMIA: 82,
  SOCIEDAD: 75,
  AMBIENTE: 60,
  SEGURIDAD: 45,
  DDHH: 88,
  INTERNACIONAL: 70,
};

const showcase: ShowcaseEntry = {
  description:
    "Card vertical de un candidato del ranking (posiciones 2+). Optimizado para grid 2-col: radar mediano (140px) con labels + %match grande + cobertura. Alternativa a RankingRow cuando se quiere dar visibilidad al breakdown por eje.",
  variants: [
    {
      label: "card en grid",
      render: () => (
        <View style={{ maxWidth: 220 }}>
          <RankingCard
            rank={2}
            nombre="Michelle"
            apellido="Bachelet"
            partido="Partido Socialista"
            matchPct={72}
            ejeScores={ejeScoresMock}
            preguntasConsideradas={12}
            onPress={() => {}}
          />
        </View>
      ),
    },
    {
      label: "con actions",
      render: () => (
        <View style={{ maxWidth: 220 }}>
          <RankingCard
            rank={3}
            nombre="Jose Antonio"
            apellido="Kast"
            partido="Republicanos"
            matchPct={28}
            ejeScores={ejeScoresMock}
            preguntasConsideradas={9}
            onPress={() => {}}
            actions={
              <DemoText tone="secondary" style={{ fontSize: 11 }}>
                Slot para BookmarkActions u otras acciones.
              </DemoText>
            }
          />
        </View>
      ),
    },
    {
      label: "sin radar (fallback)",
      render: () => (
        <View style={{ maxWidth: 220 }}>
          <RankingCard
            rank={4}
            nombre="Evelyn"
            apellido="Matthei"
            partido="UDI"
            matchPct={54}
            onPress={() => {}}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "rank", type: "number", required: true },
    { name: "nombre", type: "string", required: true },
    { name: "apellido", type: "string", description: "Opcional." },
    { name: "partido", type: "string", description: "Opcional." },
    { name: "matchPct", type: "number", required: true },
    { name: "matchColor", type: "string", description: "Color del % y del polígono del radar." },
    { name: "ejeScores", type: "Record<string, number>", description: "3+ ejes para mostrar radar." },
    { name: "preguntasConsideradas", type: "number", description: "Cobertura del match." },
    { name: "onPress", type: "() => void" },
    { name: "actions", type: "ReactNode", description: "Slot al pie del card (ej. BookmarkActions)." },
  ],
  snippet: `import { RankingCard, BookmarkActions } from "@/components";

<RankingCard
  rank={i + 2}
  nombre={c.nombre}
  apellido={c.apellido}
  partido={c.partido}
  matchPct={c.matchPercent}
  ejeScores={c.scoresByEje}
  preguntasConsideradas={c.preguntasConsideradas}
  onPress={() => navigate("DetalleCandidato", { id: c.id })}
  actions={<BookmarkActions ... />}
/>`,
};

export default showcase;
