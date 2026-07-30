import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { NewsCard } from "./NewsCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function NewsCardWithBookmark() {
  const [saved, setSaved] = React.useState(false);
  return (
    <NewsCard
      headline="Boric presenta reforma tributaria con nuevos tramos para altos ingresos"
      snippet="El proyecto contempla aumentar impuestos a rentas sobre 4M mensuales y crear royalty minero..."
      source="La Tercera"
      when="hace 3 horas"
      sentiment="neutral"
      bookmarked={saved}
      onToggleBookmark={() => setSaved(!saved)}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Item de noticia con thumb tinted por sentiment + headline + snippet + meta. Bookmark opcional.",
  variants: [
    {
      label: "positive",
      render: () => (
        <NewsCard
          headline="Kast lidera encuesta con 32% en primera vuelta"
          snippet="La encuesta CADEM muestra al candidato republicano en primer lugar, seguido de Boric con 28%..."
          source="El Mercurio"
          when="hace 1 hora"
          sentiment="positive"
        />
      ),
    },
    {
      label: "con bookmark interactivo",
      render: () => <NewsCardWithBookmark />,
    },
    {
      label: "negative",
      render: () => (
        <NewsCard
          headline="Denuncian financiamiento irregular en campana municipal"
          snippet="El Servel abrio investigacion contra un candidato por presuntas donaciones no declaradas..."
          source="BioBio"
          when="ayer"
          sentiment="negative"
        />
      ),
    },
  ],
  props: [
    { name: "headline", type: "string", required: true, description: "Max 2 lineas." },
    { name: "snippet", type: "string", required: true, description: "Max 2 lineas." },
    { name: "source", type: "string", required: true },
    { name: "when", type: "string", required: true, description: "Timestamp ya formateado ('hace 3 horas', 'ayer')." },
    { name: "sentiment", type: "\"positive\" | \"neutral\" | \"negative\"", required: true },
    { name: "onPress", type: "() => void" },
    { name: "bookmarked", type: "boolean", description: "Si esta definido, se muestra el chip de bookmark." },
    { name: "onToggleBookmark", type: "() => void" },
    { name: "bookmarkLoading", type: "boolean", defaultValue: "false" },
  ],
  snippet: `import { NewsCard } from "@/components";

<NewsCard
  headline={news.title}
  snippet={news.summary}
  source={news.source}
  when={formatWhen(news.publishedAt)}
  sentiment={news.sentiment}
  onPress={() => openArticle(news.url)}
  bookmarked={news.isBookmarked}
  onToggleBookmark={() => toggleBookmark(news.id)}
/>`,
};

export default showcase;
