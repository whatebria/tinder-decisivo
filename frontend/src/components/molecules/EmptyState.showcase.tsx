import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { EmptyState } from "./EmptyState";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Placeholder cuando no hay datos. Icono central + titulo + descripcion + CTA opcional.",
  variants: [
    {
      label: "minimal",
      render: () => <EmptyState title="Sin resultados" />,
    },
    {
      label: "con descripcion",
      render: () => (
        <EmptyState
          title="No hay candidatos guardados"
          description="Marca tus favoritos desde el ranking para verlos aqui."
        />
      ),
    },
    {
      label: "con CTA",
      render: () => (
        <EmptyState
          icon="bell"
          title="Sin notificaciones nuevas"
          description="Te avisaremos cuando haya novedades sobre tus candidatos favoritos."
          actionLabel="Ir al ranking"
          onAction={() => {}}
        />
      ),
    },
  ],
  props: [
    { name: "icon", type: "IconName", defaultValue: "\"search\"" },
    { name: "title", type: "string", required: true },
    { name: "description", type: "string" },
    { name: "actionLabel", type: "string", description: "Si se omite, no renderiza CTA." },
    { name: "onAction", type: "() => void" },
  ],
  snippet: `import { EmptyState } from "@/components";

<EmptyState
  icon="search"
  title="No encontramos resultados"
  description="Prueba con otros filtros o revisa la ortografia."
  actionLabel="Limpiar filtros"
  onAction={clearFilters}
/>`,
};

export default showcase;
