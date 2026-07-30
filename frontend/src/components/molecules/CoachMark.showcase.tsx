import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CoachMark } from "./CoachMark";

// Type-only reference — el componente requiere anchor DOM real, no funciona en showcase.
void CoachMark;

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Tooltip contextual con anchor a un elemento de la UI para onboarding paso-a-paso. Usa `getBoundingClientRect` para posicionarse. NO demoable aisladamente porque requiere un ref DOM real vivo; se prueba dentro de CoachMarkTour.",
  variants: [
    {
      label: "no demoable aqui",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            CoachMark necesita un anchor DOM real. Ver CoachMarkTour para el demo integrado.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "step", type: "CoachStep | null", required: true, description: "{ id, anchorId, title, description, placement? }" },
    { name: "currentIndex", type: "number", required: true },
    { name: "total", type: "number", required: true },
    { name: "onNext", type: "() => void", required: true },
    { name: "onBack", type: "() => void", required: true },
    { name: "onSkip", type: "() => void", required: true },
  ],
  snippet: `import { CoachMark } from "@/components";

<CoachMark
  visible={showTour}
  step={steps[current]}
  currentIndex={current}
  total={steps.length}
  onNext={() => setCurrent(current + 1)}
  onBack={() => setCurrent(current - 1)}
  onSkip={() => setShowTour(false)}
/>`,
};

export default showcase;
