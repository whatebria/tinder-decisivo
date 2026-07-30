import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ScreenTopBar } from "./ScreenTopBar";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Top bar de pantallas internas: back + titulo centrado + info opcional. Layout [<-] Titulo [i].",
  variants: [
    {
      label: "completa",
      render: () => (
        <View style={{ width: "100%" }}>
          <ScreenTopBar
            title="Cuestionario"
            subtitle="PREGUNTA 3 DE 12"
            onBack={() => {}}
            onInfo={() => {}}
          />
        </View>
      ),
    },
    {
      label: "sin subtitulo ni info",
      render: () => (
        <View style={{ width: "100%" }}>
          <ScreenTopBar title="Mi perfil" onBack={() => {}} />
        </View>
      ),
    },
  ],
  props: [
    { name: "title", type: "string", required: true },
    { name: "subtitle", type: "string" },
    { name: "onBack", type: "() => void", description: "Si no se pasa, deja un placeholder a la izq para mantener centrado." },
    { name: "onInfo", type: "() => void", description: "Si no se pasa, no muestra el boton info a la derecha." },
  ],
  snippet: `import { ScreenTopBar } from "@/components";

<ScreenTopBar
  title="Cuestionario"
  subtitle={\`Pregunta \${current} de \${total}\`}
  onBack={() => navigation.goBack()}
  onInfo={() => setShowInfo(true)}
/>`,
};

export default showcase;
