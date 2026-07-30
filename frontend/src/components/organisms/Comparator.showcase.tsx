import { View } from "react-native";

import { RadarChart } from "../atoms/RadarChart";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Comparator } from "./Comparator";

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
    "2 columnas lado a lado para comparar candidatos. Si solo hay 1, la segunda columna es un add-slot dashed.",
  variants: [
    {
      label: "1 slot (con add)",
      render: () => (
        <View style={{ maxWidth: 500 }}>
          <Comparator
            slots={[
              {
                name: "Boric",
                partido: "Frente Amplio",
                initials: "GB",
                matchPercent: 87,
                chart: <RadarChart data={ejeScoresMock} size={140} />,
              },
            ]}
            onRemove={() => {}}
            onAdd={() => {}}
          />
        </View>
      ),
    },
    {
      label: "2 slots",
      render: () => (
        <View style={{ maxWidth: 500 }}>
          <Comparator
            slots={[
              {
                name: "Boric",
                partido: "Frente Amplio",
                initials: "GB",
                matchPercent: 87,
                chart: <RadarChart data={ejeScoresMock} size={140} />,
              },
              {
                name: "Kast",
                partido: "Republicanos",
                initials: "JK",
                matchPercent: 28,
                chart: <RadarChart data={ejeScoresMock} size={140} />,
              },
            ]}
            onRemove={() => {}}
          />
        </View>
      ),
    },
  ],
  props: [
    { name: "slots", type: "ReadonlyArray<ComparatorSlot>", required: true, description: "1 o 2 elementos. { name, partido, initials, matchPercent, chart? }" },
    { name: "onRemove", type: "(index: number) => void", description: "Si se pasa, muestra boton X en cada slot." },
    { name: "onAdd", type: "() => void", description: "Se activa cuando slots.length === 1." },
  ],
  snippet: `import { Comparator } from "@/components";

<Comparator
  slots={selected.map((c) => ({
    name: c.nombre,
    partido: c.partido,
    initials: c.iniciales,
    matchPercent: c.matchPercent,
    chart: <RadarChart data={c.scoresByEje} size={140} />,
  }))}
  onRemove={(i) => removeSlot(i)}
  onAdd={() => openPickerModal()}
/>`,
};

export default showcase;
