import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { TopNav } from "./TopNav";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Header minimalista para flujos multi-paso o detalle. Brand + progress opcional + accion opcional.",
  variants: [
    { label: "solo brand", render: () => <TopNav brand="Tinder Decisivo" /> },
    { label: "con progress", render: () => <TopNav brand="Cuestionario" progress={0.4} /> },
    { label: "con action", render: () => <TopNav brand="Editar perfil" actionLabel="Cerrar" onAction={() => {}} /> },
    { label: "completo", render: () => <TopNav brand="Cuestionario" progress={0.75} actionLabel="Cerrar" onAction={() => {}} /> },
  ],
  props: [
    { name: "brand", type: "string", required: true },
    { name: "progress", type: "number", description: "0-1. Si se pasa, muestra barra al medio." },
    { name: "actionLabel", type: "string", description: "Boton ghost a la derecha." },
    { name: "onAction", type: "() => void" },
  ],
  snippet: `import { TopNav } from "@/components";

<TopNav
  brand="Cuestionario"
  progress={currentIndex / total}
  actionLabel="Cerrar"
  onAction={() => navigation.goBack()}
/>`,
};

export default showcase;
