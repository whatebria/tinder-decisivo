import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { RankingRow } from "./RankingRow";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const ejeScoresMock = {
  Educacion: 82,
  Salud: 75,
  Economia: 60,
  Seguridad: 45,
  "Medio ambiente": 88,
  Cultural: 70,
};

const showcase: ShowcaseEntry = {
  description:
    "Fila del ranking (posiciones 2+). Layout horizontal: #N + avatar + nombre/partido + mini radar + %.",
  variants: [
    {
      label: "row simple",
      render: () => (
        <RankingRow
          rank={2}
          nombre="Michelle"
          apellido="Bachelet"
          partido="Partido Socialista"
          matchPct={72}
          ejeScores={ejeScoresMock}
          onPress={() => {}}
        />
      ),
    },
    {
      label: "con actions",
      render: () => (
        <RankingRow
          rank={3}
          nombre="Jose Antonio"
          apellido="Kast"
          partido="Republicanos"
          matchPct={28}
          ejeScores={ejeScoresMock}
          onPress={() => {}}
          actions={
            <View style={{ paddingTop: 8 }}>
              <DemoText tone="secondary" style={{ fontSize: 11 }}>
                Slot custom para BookmarkActions u otras acciones.
              </DemoText>
            </View>
          }
        />
      ),
    },
  ],
  props: [
    { name: "rank", type: "number", required: true },
    { name: "nombre", type: "string", required: true },
    { name: "apellido", type: "string", description: "Opcional." },
    { name: "partido", type: "string", description: "Opcional." },
    { name: "matchPct", type: "number", required: true },
    { name: "ejeScores", type: "Record<string, number>" },
    { name: "onPress", type: "() => void" },
    { name: "actions", type: "ReactNode", description: "Slot para BookmarkActions u otras acciones debajo." },
  ],
  snippet: `import { RankingRow, BookmarkActions } from "@/components";

<RankingRow
  rank={i + 2}
  nombre={c.nombre}
  apellido={c.apellido}
  partido={c.partido}
  matchPct={c.matchPercent}
  ejeScores={c.scoresByEje}
  onPress={() => navigate("DetalleCandidato", { id: c.id })}
  actions={<BookmarkActions ... />}
/>`,
};

export default showcase;
