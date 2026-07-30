import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { NovedadItem } from "./NovedadItem";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Item del feed 'Novedades' del Home HUB. 3 kinds (discriminated union): action (CTA), noticia (thumb+meta), update (avatar+texto).",
  variants: [
    {
      label: "action",
      render: () => (
        <NovedadItem
          kind="action"
          icon="alert"
          title="Complete 3 preguntas mas"
          subtitle="Para desbloquear tu match completo"
          ctaLabel="Ir al cuestionario"
          onCta={() => {}}
        />
      ),
    },
    {
      label: "noticia",
      render: () => (
        <NovedadItem
          kind="noticia"
          title="Debate presidencial se realizara el 15 de noviembre"
          snippet="El CNTV confirmo la fecha del primer debate obligatorio entre los candidatos..."
          category="Electoral"
          when="hace 2h"
        />
      ),
    },
    {
      label: "update",
      render: () => (
        <NovedadItem
          kind="update"
          avatarInitials="JB"
          title="Boric publico nueva postura sobre educacion"
          subtitle="Ahora coincides 89%"
        />
      ),
    },
  ],
  props: [
    { name: "kind", type: "\"action\" | \"noticia\" | \"update\"", required: true, description: "Discriminante. Cada valor exige un set de props distinto (union type)." },
    { name: "title", type: "string", required: true, description: "Comun a todos los kinds." },
    { name: "onPress", type: "() => void", description: "Comun a todos los kinds." },
    { name: "icon", type: "IconName", defaultValue: "\"bell\"", description: "[kind=action] Icono del CTA." },
    { name: "subtitle", type: "string", description: "[kind=action | kind=update] Texto secundario." },
    { name: "ctaLabel", type: "string", description: "[kind=action] Texto del boton." },
    { name: "onCta", type: "() => void", description: "[kind=action] Handler del boton CTA." },
    { name: "imageUrl", type: "string", description: "[kind=noticia] Thumb de la noticia." },
    { name: "snippet", type: "string", description: "[kind=noticia] Resumen de la noticia." },
    { name: "category", type: "string", description: "[kind=noticia] Categoria (ej. 'Electoral')." },
    { name: "when", type: "string", description: "[kind=noticia] Timestamp formateado." },
    { name: "avatarInitials", type: "string", description: "[kind=update] Iniciales del avatar." },
  ],
  snippet: `import { NovedadItem } from "@/components";

<NovedadItem
  kind="action"
  icon="alert"
  title="Complete 3 preguntas mas"
  ctaLabel="Ir"
  onCta={() => navigate("Cuestionario")}
/>`,
};

export default showcase;
