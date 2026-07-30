import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CandidateCard } from "./CandidateCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Fila de resultado. Avatar + info (nombre, partido, MatchTier) + % grande + chevron para detalle.",
  variants: [
    {
      label: "high match, pressable",
      render: () => (
        <CandidateCard
          name="Gabriel Boric"
          partido="Frente Amplio"
          initials="GB"
          matchPercent={87}
          onPress={() => {}}
        />
      ),
    },
    {
      label: "mid match, sin press",
      render: () => (
        <CandidateCard
          name="Michelle Bachelet"
          partido="Partido Socialista"
          initials="MB"
          matchPercent={55}
        />
      ),
    },
    {
      label: "low match con color custom",
      render: () => (
        <CandidateCard
          name="Jose Antonio Kast"
          partido="Republicanos"
          initials="JK"
          matchPercent={28}
          avatarColor="#FDECEC"
          onPress={() => {}}
        />
      ),
    },
    {
      label: "sin match (vista exploratoria)",
      render: () => (
        <CandidateCard
          name="Yasna Provoste"
          partido="Democracia Cristiana"
          initials="YP"
          matchPercent={null}
          sublabel="Presidencial"
          onPress={() => {}}
        />
      ),
    },
  ],
  props: [
    { name: "name", type: "string", required: true },
    { name: "partido", type: "string", required: true },
    { name: "initials", type: "string", required: true },
    { name: "matchPercent", type: "number | null", required: true, description: "0-100 o null para ocultar % y MatchTier (vista exploratoria)." },
    { name: "sublabel", type: "string", description: "Texto extra bajo el partido (ej. tipo eleccion)." },
    { name: "avatarColor", type: "string", description: "Color de fondo del avatar." },
    { name: "onPress", type: "() => void", description: "Si se pasa, muestra chevron." },
  ],
  snippet: `import { CandidateCard } from "@/components";

<CandidateCard
  name={c.nombre}
  partido={c.partido}
  initials={c.iniciales}
  matchPercent={c.matchPercent}
  onPress={() => navigate("DetalleCandidato", { id: c.id })}
/>`,
};

export default showcase;
