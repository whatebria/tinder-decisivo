import { View } from "react-native";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { useToast } from "./Toast";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function ToastDemo() {
  const toast = useToast();
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Button variant="success" fullWidth={false} onPress={() => toast.success("Guardado!", "Todo listo.")}>success</Button>
      <Button variant="danger" fullWidth={false} onPress={() => toast.error("Algo salio mal", "Intenta de nuevo.")}>error</Button>
      <Button fullWidth={false} onPress={() => toast.info("Sincronizando datos...")}>info</Button>
    </View>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Sistema de toasts via context. Auto-dismiss 4s, tap-para-cerrar. Reemplaza Alert.alert() (que no renderiza en RN Web). NO tiene ToastProps: se consume via hook `useToast()` dentro de un ToastProvider.",
  variants: [{ label: "disparar toasts", render: () => <ToastDemo /> }],
  props: [
    { name: "useToast()", type: "() => ToastContextValue", description: "Hook. Retorna { success, error, info, show }." },
    { name: "show", type: "(variant, title, detail?) => void" },
    { name: "success", type: "(title, detail?) => void" },
    { name: "error", type: "(title, detail?) => void" },
    { name: "info", type: "(title, detail?) => void" },
  ],
  snippet: `import { useToast } from "@/components";

function MyScreen() {
  const toast = useToast();

  async function handleSave() {
    try {
      await save();
      toast.success("Guardado!");
    } catch (e) {
      toast.error("Algo salio mal", String(e));
    }
  }
}

// En App.tsx, envolver con <ToastProvider>.`,
};

export default showcase;
