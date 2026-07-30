import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { MatchSummaryCard } from "./MatchSummaryCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Hero card horizontal de la seccion 'Tus mejores matches' del Home HUB. Muestra por cada eleccion completada el candidato con mayor afinidad: Avatar (foto o iniciales) + nombre + chip del tipo + porcentaje gigante + contexto 'coincides en N de N preguntas' + CTA 'Ver perfil'. Compone atoms Avatar/Chip/Button, no maneja fetching.",
  variants: [
    {
      label: "match alto con foto",
      render: () => (
        <MatchSummaryCard
          candidatoNombre="Ada Perez"
          candidatoFotoUrl={null}
          tipoEleccionNombre="Presidencial"
          matchPercent={87}
          preguntasConsideradas={12}
          totalPreguntas={12}
          onVerPerfil={() => {}}
        />
      ),
    },
    {
      label: "match medio (parcial)",
      render: () => (
        <MatchSummaryCard
          candidatoNombre="Gabriel Boric"
          tipoEleccionNombre="Senatorial"
          matchPercent={55}
          preguntasConsideradas={8}
          totalPreguntas={10}
          onVerPerfil={() => {}}
        />
      ),
    },
    {
      label: "nombre compuesto (iniciales primera+ultima)",
      render: () => (
        <MatchSummaryCard
          candidatoNombre="Maria Jose Perez Gonzalez"
          tipoEleccionNombre="Consejeros Regionales"
          matchPercent={72}
          preguntasConsideradas={9}
          totalPreguntas={12}
          onVerPerfil={() => {}}
        />
      ),
    },
  ],
  props: [
    { name: "candidatoNombre", type: "string", required: true, description: "Nombre completo. Se derivan iniciales si no hay foto." },
    { name: "candidatoFotoUrl", type: "string | null", description: "URL opcional. Fallback a iniciales." },
    { name: "tipoEleccionNombre", type: "string", required: true, description: "Va dentro del Chip." },
    { name: "matchPercent", type: "number", required: true, description: "0-100. Se redondea al pintar." },
    { name: "preguntasConsideradas", type: "number", required: true },
    { name: "totalPreguntas", type: "number", required: true },
    { name: "onVerPerfil", type: "() => void", required: true, description: "CTA principal." },
    { name: "style", type: "ViewStyle" },
    { name: "accessibilityLabel", type: "string", description: "Default: auto-generado desde nombre + %." },
  ],
  snippet: `import { MatchSummaryCard } from "@/components";

<MatchSummaryCard
  candidatoNombre={candidato.nombre}
oFotoUrl={candidato.profile_picture}
  tipoEleccionNombre={eleccion.nombre}
  matchPercent={top.match_percentage}
  preguntasConsideradas={top.preguntas_consideradas}
  totalPreguntas={eleccion.total_preguntas}
  onVerPerfil={() => navigate("DetalleCandidato", { candidatoId: candidato.id })}
/>`,
};

export default showcase;
