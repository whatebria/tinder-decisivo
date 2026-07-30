import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Boton circular solo con icono. 3 variantes (soft, ghost, solid) y 3 tamanos. accessibilityLabel obligatorio.",
  variants: [
    {
      label: "soft / md",
      render: () => (
        <IconButton variant="soft" accessibilityLabel="Buscar">
          <Icon name="search" size={20} />
        </IconButton>
      ),
    },
    {
      label: "ghost / md",
      render: () => (
        <IconButton variant="ghost" accessibilityLabel="Cerrar">
          <Icon name="close" size={20} />
        </IconButton>
      ),
    },
    {
      label: "solid / md",
      render: () => (
        <IconButton variant="solid" accessibilityLabel="Agregar">
          <Icon name="plus" size={20} color="#FFF" />
        </IconButton>
      ),
    },
    {
      label: "sm",
      render: () => (
        <IconButton size="sm" accessibilityLabel="Info">
          <Icon name="info" size={16} />
        </IconButton>
      ),
    },
    {
      label: "lg",
      render: () => (
        <IconButton size="lg" accessibilityLabel="Notificaciones">
          <Icon name="bell" size={24} />
        </IconButton>
      ),
    },
  ],
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Icono a renderizar (ej. <Icon />)." },
    { name: "accessibilityLabel", type: "string", required: true, description: "Texto para SR (obligatorio: sin label seria intocable a11y)." },
    { name: "variant", type: "\"soft\" | \"ghost\" | \"solid\"", defaultValue: "\"soft\"" },
    { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"" },
    { name: "onPress", type: "() => void" },
    { name: "disabled", type: "boolean" },
  ],
  snippet: `import { IconButton, Icon } from "@/components";

<IconButton variant="soft" accessibilityLabel="Buscar" onPress={openSearch}>
  <Icon name="search" size={20} />
</IconButton>`,
};

export default showcase;
