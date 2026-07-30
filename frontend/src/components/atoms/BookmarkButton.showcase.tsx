import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { BookmarkButton } from "./BookmarkButton";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function BookmarkDemo({ initial }: { initial: boolean }) {
  const [saved, setSaved] = React.useState(initial);
  return <BookmarkButton saved={saved} onPress={() => setSaved(!saved)} />;
}

const showcase: ShowcaseEntry = {
  description:
    "Chip para guardar/quitar de guardados. Idempotente (label cambia Guardar <-> Guardado). Sin iconos SVG.",
  variants: [
    { label: "unsaved", render: () => <BookmarkDemo initial={false} /> },
    { label: "saved", render: () => <BookmarkDemo initial={true} /> },
    { label: "loading", render: () => <BookmarkButton saved={false} loading onPress={() => {}} /> },
  ],
  props: [
    { name: "saved", type: "boolean", required: true },
    { name: "onPress", type: "() => void", required: true },
    { name: "loading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { BookmarkButton } from "@/components";

<BookmarkButton
  saved={isSaved}
  onPress={() => toggleSave(candidateId)}
/>`,
};

export default showcase;
