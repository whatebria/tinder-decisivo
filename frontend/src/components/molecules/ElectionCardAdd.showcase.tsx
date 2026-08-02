import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ElectionCardAdd } from "./ElectionCardAdd";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Card dashed '+ Activar' al final del strip del Home HUB. Invita a agregar una eleccion nueva.",
  variants: [
    { label: "default", render: () => <ElectionCardAdd label="Activar Congreso" onPress={() => {}} /> },
  ],
  props: [
    { name: "label", type: "string", required: true },
    { name: "onPress", type: "() => void" },
    { name: "accessibilityLabel", type: "string", description: "Default: usa el label." },
  ],
  snippet: `import { ElectionCardAdd } from "@/components";

<ElectionCardAdd label="Activar Congreso" onPress={openWizard} />`,
};

export default showcase;
