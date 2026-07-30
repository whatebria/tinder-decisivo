import React from "react";

import { Button } from "../atoms/Button";
import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { NoticiaDetailSheet } from "./NoticiaDetailSheet";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function NoticiaDetailSheetDemo({ variant }: { variant: "completa" | "minima" | "sinLink" }) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const noticiaCompleta = {
    id: 1,
    titulo: "Gabriel Boric anuncia nueva politica de vivienda con foco en clase media",
    descripcion:
      "El presidente presento un plan de subsidios y regulacion del mercado de arriendos que apunta a reducir la brecha entre ingresos y costo de vida. Incluye 60 mil nuevas soluciones habitacionales en 2026 y modificaciones tributarias para propiedades sin uso.",
    url: "https://www.latercera.com/noticia/ejemplo",
    fuente: "La Tercera",
    imagenUrl: "https://picsum.photos/seed/noticia1/800/400",
    fechaFormateada: "hace 3 horas",
    sentiment: "positive" as const,
    candidatosMencionados: [
      { id: 1, nombre: "Gabriel", apellido: "Boric" },
      { id: 2, nombre: "Jose Antonio", apellido: "Kast" },
    ],
  };

  const noticiaMinima = {
    id: 2,
    titulo: "Debate presidencial reune a 5 candidatos en TVN",
    descripcion:
      "Los candidatos discutieron economia, seguridad y educacion en un formato de 90 minutos.",
    url: "https://www.emol.com/noticia/ejemplo",
    fuente: "Emol",
    imagenUrl: null,
    fechaFormateada: "ayer",
    sentiment: "neutral" as const,
  };

  const noticiaSinLink = {
    id: 3,
    titulo: "Encuesta muestra empate tecnico entre principales candidatos",
    descripcion: "Segun el sondeo, 3 de cada 5 votantes sigue indeciso.",
    url: null,
    fuente: "Cadem",
    imagenUrl: null,
    fechaFormateada: "hace 2 dias",
    sentiment: "negative" as const,
  };

  const noticia =
    variant === "completa" ? noticiaCompleta : variant === "minima" ? noticiaMinima : noticiaSinLink;

  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>
        Abrir preview
      </Button>
      <NoticiaDetailSheet
        visible={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
        bookmarked={variant === "completa" ? saved : undefined}
        onToggleBookmark={variant === "completa" ? () => setSaved((s) => !s) : undefined}
      />
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Bottom sheet con el detalle completo de una noticia (imagen hero, meta, titulo, descripcion, candidatos mencionados) + boton 'Abrir noticia original' que hace Linking.openURL. Se abre al tocar una NewsCard.",
  variants: [
    { label: "completa (imagen + bookmark + candidatos)", render: () => <NoticiaDetailSheetDemo variant="completa" /> },
    { label: "minima (sin imagen ni bookmark)", render: () => <NoticiaDetailSheetDemo variant="minima" /> },
    { label: "sin link (footer oculto)", render: () => <NoticiaDetailSheetDemo variant="sinLink" /> },
  ],
  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "noticia", type: "NoticiaDetail | null", required: true, description: "{ id, titulo, descripcion, url?, fuente?, imagenUrl?, fechaFormateada, sentiment, candidatosMencionados? }" },
    { name: "bookmarked", type: "boolean", description: "Si se pasa junto con onToggleBookmark, muestra el BookmarkButton." },
    { name: "onToggleBookmark", type: "() => void" },
    { name: "bookmarkLoading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { NoticiaDetailSheet, type NoticiaDetail } from "@/components";

const [selected, setSelected] = useState<NoticiaDetail | null>(null);

<NoticiaDetailSheet
  visible={selected !== null}
  onClose={() => setSelected(null)}
  noticia={selected}
/>`,
};

export default showcase;
