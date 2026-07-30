import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Progress } from "./Progress";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Barra de progreso horizontal. Verde salvia para sensacion organica. Value 0-1 con clamp automatico.",
  variants: [
    { label: "0%", render: () => <View style={{ width: 200 }}><Progress value={0} /></View> },
    { label: "50%", render: () => <View style={{ width: 200 }}><Progress value={0.5} /></View> },
    { label: "100%", render: () => <View style={{ width: 200 }}><Progress value={1} /></View> },
    { label: "height custom", render: () => <View style={{ width: 200 }}><Progress value={0.75} height={16} /></View> },
  ],
  props: [
    { name: "value", type: "number", required: true, description: "0 a 1. Se clampea automaticamente." },
    { name: "height", type: "number", defaultValue: "8", description: "Alto de la barra en px." },
  ],
  snippet: `import { Progress } from "@/components";

<Progress value={completed / total} />`,
};

export default showcase;
