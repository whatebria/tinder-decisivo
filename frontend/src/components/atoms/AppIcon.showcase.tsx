import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { AppIcon } from "./AppIcon";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Icono oficial de la app. Pentagon relleno (radar) + silueta de persona. " +
    "Se adapta a light/dark via useThemeColors. " +
    "A size>=32 agrega el data polygon de afinidad.",
  variants: [
    { label: "size 22 (HomeTopBar)",  render: () => <AppIcon size={22} /> },
    { label: "size 32",               render: () => <AppIcon size={32} /> },
    { label: "size 48 (+data poly)",  render: () => <AppIcon size={48} /> },
    { label: "size 80 (+data poly)",  render: () => <AppIcon size={80} /> },
  ],
  props: [
    {
      name: "size",
      type: "number",
      defaultValue: "24",
      description: "Tamano cuadrado en px. A size>=32 se muestra el data polygon.",
    },
  ],
  snippet: `import { AppIcon } from "@/components";

// En HomeTopBar (equivalente al heart anterior)
<AppIcon size={22} />

// Con data polygon visible
<AppIcon size={48} />`,
};

export default showcase;
