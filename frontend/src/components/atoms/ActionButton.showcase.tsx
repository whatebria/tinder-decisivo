import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ActionButton, useActionColors } from "./ActionButton";
import { Icon } from "./Icon";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

type ActionVariant = "like" | "dislike" | "undo" | "info";

function ActionButtonDemo({ variant }: { variant: ActionVariant }) {
  const colors = useActionColors();
  const iconName =
    variant === "like" ? "heart" :
    variant === "dislike" ? "close" :
    variant === "undo" ? "undo" : "info";
  const size = variant === "like" || variant === "dislike" ? 28 : 22;
  return (
    <ActionButton variant={variant} accessibilityLabel={variant}>
      <Icon name={iconName} size={size} color={colors[variant]} />
    </ActionButton>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Circulo grande tipo Tinder para acciones swipe. 4 variantes (like, dislike, undo, info). Usa useActionColors() para el color del icono.",
  variants: [
    { label: "like (64px)", render: () => <ActionButtonDemo variant="like" /> },
    { label: "dislike (64px)", render: () => <ActionButtonDemo variant="dislike" /> },
    { label: "undo (48px)", render: () => <ActionButtonDemo variant="undo" /> },
    { label: "info (48px)", render: () => <ActionButtonDemo variant="info" /> },
  ],
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Icono a renderizar." },
    { name: "variant", type: "\"like\" | \"dislike\" | \"undo\" | \"info\"", required: true },
    { name: "accessibilityLabel", type: "string", required: true },
    { name: "onPress", type: "() => void" },
    { name: "disabled", type: "boolean" },
  ],
  snippet: `import { ActionButton, Icon, useActionColors } from "@/components";

function LikeButton() {
  const colors = useActionColors();
  return (
    <ActionButton variant="like" accessibilityLabel="Me gusta" onPress={onLike}>
      <Icon name="heart" size={28} color={colors.like} />
    </ActionButton>
  );
}`,
};

export default showcase;
