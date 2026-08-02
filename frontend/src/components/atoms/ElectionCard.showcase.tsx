import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ElectionCard } from "./ElectionCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "doNotUse" | "relatedTo" | "dsReference"
>;

const showcase: ShowcaseEntry = {
  description:
    "Card de eleccion activa en el Home HUB. 3 variantes (active, secondary, pending). Badge de estado (Completado/Pendiente) si isCompleted esta definido. " +
    "ATENCION: ubicacion atoms/ es incorrecta — pendiente mover a molecules/ (TASK-060).",

  status: "experimental",

  doNotUse: [
    "No pasar matchPercent + progressPercent (modo legacy): usar respondidas + totalPreguntas.",
    "No instanciar directamente en pantallas: usar ElectionsStrip que gestiona la lista completa.",
  ],

  relatedTo: ["ElectionsStrip", "ElectionCardAdd", "MatchSummaryCard"],
  dsReference: "DS-12 Home HUB",
  variants: [
      label: "active + completado",
      render: () => (
        <ElectionCard
          name="Presidencial 2025"
          scope="NACIONAL"
          isCompleted
          matchPercent={87}
          progressPercent={100}
          variant="active"
        />
      ),
    },
    {
      label: "secondary + completado",
      render: () => (
        <ElectionCard
          name="Municipal Providencia"
          scope="COMUNAL"
          isCompleted
          matchPercent={64}
          progressPercent={100}
        />
      ),
    },
    {
      label: "pending (sin cuestionario)",
      render: () => (
        <ElectionCard
          name="Convencion Constituyente 2026"
          scope="NACIONAL"
          isCompleted={false}
          progressPercent={0}
          pendingLabel="6 preguntas pendientes"
          variant="pending"
        />
      ),
    },
    {
      label: "loading (sin badge)",
      render: () => (
        <ElectionCard
          name="Plebiscito Constitucional"
          scope="NACIONAL"
          progressPercent={0}
          pendingLabel="Cargando..."
          variant="pending"
        />
      ),
    },
    {
      label: "esBase (Preguntas generales)",
      render: () => (
        <ElectionCard
          name="Preguntas generales"
          esBase
          isCompleted
          progressPercent={100}
        />
      ),
    },
  ],
  props: [
    { name: "name", type: "string", required: true },
    { name: "scope", type: "string", description: "Ej. 'NACIONAL', 'COMUNAL'. Se ignora si esBase=true." },
    { name: "isCompleted", type: "boolean", description: "Si el user completo el cuestionario. Undefined oculta el badge (util para skeletons)." },
    { name: "matchPercent", type: "number | null", description: "0-100. null si aun no hay match. Se ignora si esBase=true." },
    { name: "progressPercent", type: "number", description: "0-100 progreso del cuestionario." },
    { name: "pendingLabel", type: "string", description: "Texto alt cuando no hay match." },
    { name: "esBase", type: "boolean", defaultValue: "false", description: "Si true, la card representa un TipoEleccion con es_base=true (preguntas transversales). Oculta match%, muestra chip 'APLICA A TODAS'." },
    { name: "baseHint", type: "string", description: "Texto explicativo para cards esBase. Default: 'Mejora tus matches en todas las elecciones'." },
    { name: "variant", type: "\"active\" | \"secondary\" | \"pending\"", defaultValue: "\"secondary\"" },
    { name: "onPress", type: "() => void" },
    // --- Props legacy (deprecadas) ---
    { name: "matchPercent", type: "number | null", description: "@deprecated. Usar respondidas + totalPreguntas. Se ignora si respondidas esta definido." },
    { name: "progressPercent", type: "number", description: "@deprecated. Usar respondidas + totalPreguntas." },
    { name: "pendingLabel", type: "string", description: "@deprecated. Texto alt cuando no hay match." },
  ],
  snippet: `import { ElectionCard } from "@/components";

<ElectionCard
  name="Presidencial 2025"
  scope="NACIONAL"
  isCompleted
  matchPercent={87}
  progressPercent={100}
  variant="active"
  onPress={() => selectElection(id)}
/>`,
};

export default showcase;
