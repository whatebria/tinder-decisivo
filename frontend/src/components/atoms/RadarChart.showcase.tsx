import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { RadarChart } from "./RadarChart";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const RADAR_DATA = {
  ECONOMIA: 85,
  SOCIEDAD: 72,
  AMBIENTE: 90,
  SEGURIDAD: 45,
  DDHH: 78,
  INTERNACIONAL: 60,
  INSTITUCIONAL: 55,
  OTRO: 40,
};

const showcase: ShowcaseEntry = {
  description:
    "Poligono SVG que muestra score por eje tematico. Usa react-native-svg (funciona en iOS/Android/web).",
  variants: [
    { label: "default (8 ejes)", render: () => <RadarChart data={RADAR_DATA} size={220} /> },
    { label: "sin labels", render: () => <RadarChart data={RADAR_DATA} size={180} showLabels={false} /> },
    { label: "color custom", render: () => <RadarChart data={RADAR_DATA} size={200} color="#B85C5C" /> },
  ],
  props: [
    { name: "data", type: "Record<string, number>", required: true, description: "Score 0-100 por eje. <3 ejes retorna null." },
    { name: "size", type: "number", defaultValue: "240", description: "Cuadrado contenedor." },
    { name: "color", type: "string", description: "Color del poligono. Default: primary." },
    { name: "showLabels", type: "boolean", defaultValue: "true" },
    { name: "levels", type: "number", defaultValue: "4", description: "Cantidad de anillos concentricos." },
  ],
  snippet: `import { RadarChart } from "@/components";

<RadarChart
  data={{ ECONOMIA: 85, SOCIEDAD: 72, AMBIENTE: 90 }}
  size={240}
/>`,
};

export default showcase;
