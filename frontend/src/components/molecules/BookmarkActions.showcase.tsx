import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { BookmarkActions } from "./BookmarkActions";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function BookmarkActionsDemo({ size }: { size: "sm" | "lg" }) {
  const [fav, setFav] = React.useState(false);
  const [desc, setDesc] = React.useState(false);
  return (
    <BookmarkActions
      isFavorito={fav}
      isDescartado={desc}
      onToggleFavorito={() => {
        setFav(!fav);
        if (!fav) setDesc(false);
      }}
      onToggleDescartado={() => {
        setDesc(!desc);
        if (!desc) setFav(false);
      }}
      size={size}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Par de toggles favorito + descartar. 2 tamanos (sm chip, lg boton de 48px WCAG).",
  variants: [
    { label: "sm (chips)", render: () => <BookmarkActionsDemo size="sm" /> },
    { label: "lg (botones grandes)", render: () => <BookmarkActionsDemo size="lg" /> },
    {
      label: "sm sin descartar",
      render: () => (
        <BookmarkActions
          isFavorito={true}
          isDescartado={false}
          onToggleFavorito={() => {}}
          onToggleDescartado={() => {}}
          showDescartar={false}
        />
      ),
    },
  ],
  props: [
    { name: "isFavorito", type: "boolean", required: true },
    { name: "isDescartado", type: "boolean", required: true },
    { name: "onToggleFavorito", type: "() => void", required: true },
    { name: "onToggleDescartado", type: "() => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
    { name: "size", type: "\"sm\" | \"lg\"", defaultValue: "\"sm\"" },
    { name: "showDescartar", type: "boolean", defaultValue: "true" },
  ],
  snippet: `import { BookmarkActions } from "@/components";

<BookmarkActions
  isFavorito={candidato.isFavorito}
  isDescartado={candidato.isDescartado}
  onToggleFavorito={() => toggleFavorito(candidato.id)}
  onToggleDescartado={() => toggleDescartado(candidato.id)}
  loading={mutation.isPending}
  size="lg"
/>`,
};

export default showcase;
