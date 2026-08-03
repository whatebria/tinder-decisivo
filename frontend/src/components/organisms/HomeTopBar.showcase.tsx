import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { HomeTopBar } from "./HomeTopBar";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Top bar del Home. Brand con icono heart + notif button. Distinta a TopNav (que es para flujos multi-paso).",
  variants: [
    { label: "solo brand", render: () => <HomeTopBar brand="VotoAFin" /> },
    { label: "con notificaciones", render: () => <HomeTopBar brand="VotoAFin" onNotifications={() => {}} /> },
  ],
  props: [
    { name: "brand", type: "string", required: true },
    { name: "onNotifications", type: "() => void", description: "Si se omite, no muestra el boton." },
  ],
  snippet: `import { HomeTopBar } from "@/components";

<HomeTopBar
  brand="VotoAFin"
  onNotifications={() => navigate("Notificaciones")}
/>`,
};

export default showcase;
