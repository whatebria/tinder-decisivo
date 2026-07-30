import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Link } from "./Link";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Texto interactivo estilo hyperlink. Modo inline (default) para \"aprende mas\" o block para acciones tipo \"Volver\".",
  variants: [
    { label: "inline", render: () => <Link onPress={() => {}}>Aprende mas</Link> },
    { label: "inline + underline", render: () => <Link underline onPress={() => {}}>Terminos y condiciones</Link> },
    { label: "block", render: () => <Link block onPress={() => {}}>Ir a mi perfil</Link> },
    { label: "color custom", render: () => <Link color="#B85C5C" onPress={() => {}}>Eliminar cuenta</Link> },
    { label: "disabled", render: () => <Link disabled onPress={() => {}}>No disponible</Link> },
  ],
  props: [
    { name: "children", type: "string", required: true },
    { name: "underline", type: "boolean", defaultValue: "false" },
    { name: "block", type: "boolean", defaultValue: "false", description: "Tap-area grande, stretch, texto centrado. Ideal para acciones dentro de un menu." },
    { name: "color", type: "string", description: "Color custom. Default: primary del tema." },
    { name: "onPress", type: "() => void" },
    { name: "disabled", type: "boolean" },
  ],
  snippet: `import { Link } from "@/components";

<Link onPress={() => navigate("Terminos")}>
  Ver terminos completos
</Link>`,
};

export default showcase;
