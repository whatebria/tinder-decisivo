import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Avatar } from "./Avatar";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Circulo con iniciales o imagen. 4 tamanos. Fallback automatico a iniciales si la imagen falla.",
  variants: [
    { label: "sm (32)", render: () => <Avatar initials="JB" size="sm" /> },
    { label: "md (44)", render: () => <Avatar initials="GB" size="md" /> },
    { label: "lg (64)", render: () => <Avatar initials="JK" size="lg" /> },
    { label: "xl (96)", render: () => <Avatar initials="MB" size="xl" /> },
    { label: "color custom", render: () => <Avatar initials="EP" size="lg" backgroundColor="#B85C5C" /> },
  ],
  props: [
    { name: "initials", type: "string", required: true, description: "Se cortan a 3 chars y pasan a mayusculas." },
    { name: "imageUrl", type: "string | null", description: "URL de la foto. Fallback a iniciales si falla." },
    { name: "size", type: "\"sm\" | \"md\" | \"lg\" | \"xl\"", defaultValue: "\"md\"" },
    { name: "backgroundColor", type: "string", description: "Solo para fallback iniciales. Default: secondary." },
    { name: "color", type: "string", description: "Color del texto (iniciales). Default: textOnPrimary." },
  ],
  snippet: `import { Avatar } from "@/components";

<Avatar initials="JB" imageUrl={user.photoUrl} size="lg" />`,
};

export default showcase;
