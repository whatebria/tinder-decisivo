import { View } from "react-native";

import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CoachMarkTour } from "./CoachMarkTour";

void CoachMarkTour;

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Container que orquesta un tour completo de onboarding: consume `TourId` desde src/onboarding/tours.ts, controla estado de step activo, y renderiza CoachMark. Se dropea en un screen y se auto-activa si no fue completado.",
  variants: [
    {
      label: "no demoable aqui",
      render: () => (
        <View style={{ padding: 12 }}>
          <DemoText tone="secondary" style={{ fontSize: 13 }}>
            CoachMarkTour necesita anchors DOM reales dentro de screens especificas (HomeHUB, ConfigScreen). Se prueba integrado en la app.
          </DemoText>
        </View>
      ),
    },
  ],
  props: [
    { name: "tourId", type: "TourId", required: true, description: "Identificador del tour. Ej. 'home-hub-intro', 'primer-cuestionario'." },
  ],
  snippet: `import { CoachMarkTour } from "@/components";

function HomeHUB() {
  return (
    <>
      <MainContent />
      <CoachMarkTour tourId="home-hub-intro" />
    </>
  );
}`,
};

export default showcase;
