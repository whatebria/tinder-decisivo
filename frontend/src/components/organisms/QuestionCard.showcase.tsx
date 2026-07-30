import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { QuestionCard } from "./QuestionCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function QuestionCardDemo() {
  const [v, setV] = React.useState<string | null>(null);
  return (
    <QuestionCard
      questionNumber={3}
      totalQuestions={12}
      category="Salud"
      question="El Estado deberia aumentar el gasto en salud publica financiado con mas impuestos"
      options={[
        { value: "strongly_agree", label: "Muy de acuerdo" },
        { value: "agree", label: "De acuerdo" },
        { value: "neutral", label: "Neutral" },
        { value: "disagree", label: "En desacuerdo" },
        { value: "strongly_disagree", label: "Muy en desacuerdo" },
      ]}
      value={v}
      onChange={setV}
      onSkip={() => {}}
      onPrev={() => {}}
      onNext={() => {}}
      nextDisabled={v === null}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Corazon del cuestionario. Header (N de M + categoria) + Progress + enunciado + RadioGroup + footer (No se / Volver / Siguiente).",
  variants: [
    { label: "interactive", render: () => <QuestionCardDemo /> },
    {
      label: "sin categoria ni skip",
      render: () => (
        <QuestionCard
          questionNumber={1}
          totalQuestions={5}
          question="Estas de acuerdo?"
          options={[
            { value: "yes", label: "Si" },
            { value: "no", label: "No" },
          ]}
          value={null}
          onChange={() => {}}
          onNext={() => {}}
          nextDisabled
        />
      ),
    },
  ],
  props: [
    { name: "questionNumber", type: "number", required: true },
    { name: "totalQuestions", type: "number", required: true },
    { name: "category", type: "string", description: "Se muestra como Badge info." },
    { name: "question", type: "string", required: true },
    { name: "options", type: "ReadonlyArray<RadioOption<T>>", required: true },
    { name: "value", type: "T | null", required: true },
    { name: "onChange", type: "(v: T) => void", required: true },
    { name: "onSkip", type: "() => void", description: "Boton solo se renderiza si el handler existe." },
    { name: "onPrev", type: "() => void", description: "Boton solo se renderiza si el handler existe." },
    { name: "onNext", type: "() => void", description: "Boton solo se renderiza si el handler existe." },
    { name: "nextDisabled", type: "boolean" },
    { name: "canGoBack", type: "boolean", defaultValue: "true" },
  ],
  snippet: `import { QuestionCard } from "@/components";

<QuestionCard
  questionNumber={index + 1}
  totalQuestions={preguntas.length}
  category={pregunta.eje_tematico_display}
  question={pregunta.texto}
  options={pregunta.opciones.map((o) => ({ value: o.id, label: o.texto }))}
  value={respuestas[pregunta.id]?.opcion_id ?? null}
  onChange={(id) => setRespuesta(pregunta.id, id)}
  onNext={() => goNext()}
  nextDisabled={!respuestas[pregunta.id]}
/>`,
};

export default showcase;
