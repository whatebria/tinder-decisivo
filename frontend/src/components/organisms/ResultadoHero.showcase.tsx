import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ResultadoHero } from "./ResultadoHero";

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
    "Card hero para el top match del ranking. Avatar XL + nombre + partido + % grande + radar chart + CTA.",
  variants: [
    {
      label: "completo (top match)",
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
          />
        </View>
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
  ],
  snippet: `import { ResultadoHero } from "@/components";

<ResultadoHero
  nombre={top.nombre}
  apellido={top.apellido}
  partido={top.partido}
  matchPct={top.matchPercent}
  ejeScores={top.scoresByEje}
  onCta={() => navigate("DetalleCandidato", { id: top.id })}
/>`,
};

export default showcase;
