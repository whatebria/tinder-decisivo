import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { DimensionCard } from "./DimensionCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Card para mostrar el impacto de algo (ej: una pregunta del cuestionario) sobre una dimension tematica del dominio. Composicion: borde izquierdo del color de dimension + header con DimensionBadge + label coloreado + body de texto. Consume src/domain/dimensiones.ts + useDimensionColors, contraste WCAG AA garantizado en ambos themes.",
  variants: [
    {
      label: "economico",
      render: () => (
        <DimensionCard dimension="economico">
          Mayor gasto publico requiere subir impuestos o reasignar recursos.
        </DimensionCard>
      ),
    },
    {
      label: "institucional",
      render: () => (
        <DimensionCard dimension="institucional">
          Fortalece FONASA respecto del sistema privado.
        </DimensionCard>
      ),
    },
    {
      label: "ambiental",
      render: () => (
        <DimensionCard dimension="ambiental">
          Impacto directo sobre ecosistemas y matriz energetica.
        </DimensionCard>
      ),
    },
  ],
  props: [
    { name: "dimension", type: "\"economico\" | \"social\" | \"cultural\" | \"ambiental\" | \"institucional\"", required: true },
    { name: "children", type: "ReactNode", required: true, description: "String o nodos custom." },
    { name: "labelOverride", type: "string", description: "Override del label si se necesita algo distinto al del catalogo." },
  ],
  snippet: `import { DimensionCard } from "@/components";

<DimensionCard dimension="institucional">
  Fortalece FONASA respecto del sistema privado.
</DimensionCard>`,
};

export default showcase;
