import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ResultadoHero } from "./ResultadoHero";

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
    "Card hero para el top match del ranking. Responsive: en mobile (<720px) es vertical estilo RankingCard XL (info + radar + %match + CTA en columna); en desktop/tablet (>=720px) es un split 2-col (info + CTA a la izquierda, radar 220px a la derecha). Prop 'layout' fuerza uno especifico.",
  variants: [
    {
      label: "vertical (mobile/auto en <720px)",
      render: () => (
        <View style={{ maxWidth: 360 }}>
          <ResultadoHero
            nombre="Gabriel"
            apellido="Boric"
            partido="Frente Amplio"
            matchPct={87}
            ejeScores={ejeScoresMock}
            confianzaLabel="Confianza alta"
            confianzaVariant="success"
            confianzaSubtext="10 preguntas coinciden"
            ctaLabel="Ver perfil completo"
            onCta={() => {}}
            layout="vertical"
          />
        </View>
      ),
    },
    {
      label: "horizontal (desktop/tablet)",
      render: () => (
        <View style={{ maxWidth: 720 }}>
          <ResultadoHero
            nombre="Gabriel"
            apellido="Boric"
            partido="Frente Amplio"
            matchPct={87}
            ejeScores={ejeScoresMock}
            confianzaLabel="Confianza alta"
            confianzaVariant="success"
            confianzaSubtext="10 preguntas coinciden"
            ctaLabel="Ver perfil completo"
            onCta={() => {}}
            layout="horizontal"
          />
        </View>
      ),
    },
    {
      label: "auto (responsive al viewport)",
      render: () => (
        <ResultadoHero
          nombre="Jose Antonio"
          apellido="Kast"
          partido="Republicanos"
          matchPct={62}
          ejeScores={ejeScoresMock}
          confianzaLabel="Confianza media"
          confianzaVariant="warning"
          confianzaSubtext="7 preguntas coinciden"
          onCta={() => {}}
        />
      ),
    },
  ],
  props: [
    { name: "nombre", type: "string", required: true },
    { name: "apellido", type: "string", description: "Opcional." },
    { name: "partido", type: "string", description: "Opcional." },
    { name: "matchPct", type: "number", required: true },
    { name: "matchColor", type: "string", description: "Override del color del %." },
    { name: "ejeScores", type: "Record<string, number>", description: "3+ ejes para mostrar radar." },
    { name: "confianzaLabel", type: "string", description: "Chip de confianza (ej: 'Confianza alta')." },
    { name: "confianzaVariant", type: "BadgeVariant", description: "Color del chip." },
    { name: "confianzaSubtext", type: "string", description: "Texto contextual al lado del chip." },
    { name: "ctaLabel", type: "string", defaultValue: "\"Ver perfil completo\"" },
    { name: "onCta", type: "() => void" },
    { name: "layout", type: "\"auto\" | \"vertical\" | \"horizontal\"", defaultValue: "\"auto\"", description: "Layout responsive. Auto usa window width (>=720px = horizontal)." },
  ],
  snippet: `import { ResultadoHero } from "@/components";

<ResultadoHero
  nombre={top.nombre}
  apellido={top.apellido}
  partido={top.partido}
  matchPct={top.matchPercent}
  ejeScores={top.scoresByEje}
  confianzaLabel="Confianza alta"
  confianzaVariant="success"
  confianzaSubtext="10 preguntas coinciden"
  onCta={() => navigate("DetalleCandidato", { id: top.id })}
/>`,
};

export default showcase;
