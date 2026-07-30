import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { PosturaItem } from "./PosturaItem";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Compara respuesta del usuario vs candidato. Border-left semantico segun tipo de match.",
  variants: [
    {
      label: "match total",
      render: () => (
        <PosturaItem
          question="Se debe aumentar el gasto en salud publica financiado con mas impuestos"
          userAnswer="De acuerdo"
          candidateAnswer="De acuerdo"
          candidateName="Boric"
          match="match"
        />
      ),
    },
    {
      label: "partial",
      render: () => (
        <PosturaItem
          question="Se debe eliminar el sistema ISAPRE"
          userAnswer="Muy de acuerdo"
          candidateAnswer="Neutral"
          candidateName="Bachelet"
          match="partial"
        />
      ),
    },
    {
      label: "no-match",
      render: () => (
        <PosturaItem
          question="Se debe aumentar la pena minima por delitos violentos"
          userAnswer="En desacuerdo"
          candidateAnswer="Muy de acuerdo"
          candidateName="Kast"
          match="no-match"
        />
      ),
    },
  ],
  props: [
    { name: "question", type: "string", required: true },
    { name: "userAnswer", type: "string", required: true },
    { name: "candidateAnswer", type: "string", required: true },
    { name: "candidateName", type: "string", defaultValue: "\"Candidato\"" },
    { name: "match", type: "\"match\" | \"partial\" | \"no-match\"", required: true },
    { name: "matchLabel", type: "string", description: "Default segun match." },
    { name: "bookmarked", type: "boolean", description: "Si definido, muestra bookmark." },
    { name: "onToggleBookmark", type: "() => void" },
  ],
  snippet: `import { PosturaItem } from "@/components";

<PosturaItem
  question={postura.pregunta}
  userAnswer={postura.miRespuesta}
  candidateAnswer={postura.respuestaCandidato}
  candidateName={candidato.nombre}
  match={postura.tipo}
/>`,
};

export default showcase;
