import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { QuestionCard } from "./QuestionCard";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const OPCIONES = [
  { value: 5, label: "Muy de acuerdo" },
  { value: 4, label: "De acuerdo" },
  { value: 3, label: "Neutral" },
  { value: 2, label: "En desacuerdo" },
  { value: 1, label: "Muy en desacuerdo" },
];

const showcase: ShowcaseEntry = {
  description:
    "Corazon del cuestionario. Header con numero de pregunta + Badge de categoria, Progress, enunciado, RadioGroup Likert y footer con Anterior / Siguiente. Composicion pura de atoms/molecules.",
  variants: [
    {
      label: "primera pregunta, sin respuesta",
      render: () => (
        <QuestionCard<number>
          questionNumber={1}
          totalQuestions={20}
          category="Educacion"
          question="El Estado debe garantizar educacion gratuita y de calidad en todos los niveles."
          options={OPCIONES}
          value={null}
          onChange={() => {}}
          onNext={() => {}}
          nextDisabled
        />
      ),
    },
    {
      label: "con respuesta + navegacion completa",
      render: () => (
        <QuestionCard<number>
          questionNumber={7}
          totalQuestions={20}
          category="Economia"
          question="El gobierno debe aumentar el salario minimo por encima de la inflacion."
          options={OPCIONES}
          value={4}
          onChange={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onSkip={() => {}}
          nextDisabled={false}
        />
      ),
    },
  ],
  props: [
    { name: "questionNumber", type: "number", required: true },
    { name: "totalQuestions", type: "number", required: true },
    { name: "category", type: "string", description: "Se muestra como Badge." },
    { name: "question", type: "string", required: true },
    { name: "options", type: "ReadonlyArray<RadioOption<T>>", required: true },
    { name: "value", type: "T | null", required: true },
    { name: "onChange", type: "(v: T) => void", required: true },
    { name: "onSkip", type: "() => void", description: "Muestra boton Omitir." },
    { name: "onPrev", type: "() => void", description: "Muestra boton Anterior." },
    { name: "onNext", type: "() => void" },
    { name: "nextDisabled", type: "boolean" },
    { name: "canGoBack", type: "boolean", description: "Default: true si onPrev existe." },
  ],
  snippet: `import { QuestionCard } from "@/components";

<QuestionCard<number>
  questionNumber={currentIndex + 1}
  totalQuestions={preguntas.length}
  category={pregunta.eje_tematico_display}
  question={pregunta.texto}
  options={opcionesRegulares}
  value={opcionId}
  onChange={setOpcionId}
  onNext={handleNext}
  onPrev={handlePrev}
  nextDisabled={opcionId == null}
/>`,
};

export default showcase;
