/**
 * Catalogo de moleculas: FORMS y controles compuestos.
 *
 * Incluye: FormField, RadioGroup, WeightSelector, BookmarkActions.
 */

import React from "react";
import { View } from "react-native";

import {
  BookmarkActions,
  FormField,
  RadioGroup,
  WeightSelector,
  type Weight,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

function FormFieldDemo() {
  const [v, setV] = React.useState("");
  return (
    <View style={{ width: "100%" }}>
      <FormField
        label="Correo electronico"
        value={v}
        onChangeText={setV}
        placeholder="tu@correo.cl"
        helper="Se usa para recuperar tu cuenta."
      />
    </View>
  );
}

function RadioGroupDemo() {
  const [v, setV] = React.useState<string | null>(null);
  return (
    <RadioGroup
      value={v}
      onChange={setV}
      options={[
        { value: "strongly_agree", label: "Muy de acuerdo" },
        { value: "agree", label: "De acuerdo" },
        { value: "neutral", label: "Neutral" },
        { value: "disagree", label: "En desacuerdo" },
        { value: "strongly_disagree", label: "Muy en desacuerdo" },
      ]}
    />
  );
}

function WeightSelectorDemo() {
  const [w, setW] = React.useState<Weight | null>(null);
  return <WeightSelector value={w} onChange={setW} />;
}

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

export const formsMoleculesCatalog: CatalogEntry[] = [
  {
    name: "FormField",
    path: "molecules/FormField",
    category: "molecules",
    description: "Label + Input + helper (o error). Se anuncia como bloque unico a screen readers.",
    variants: [
      { label: "con helper", render: () => <FormFieldDemo /> },
      {
        label: "con error",
        render: () => (
          <View style={{ width: "100%" }}>
            <FormField
              label="Correo"
              value="valor invalido"
              onChangeText={() => {}}
              error="El correo debe tener formato tu@dominio.cl"
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "label", type: "string", required: true },
      { name: "helper", type: "string", description: "Texto de ayuda debajo del input." },
      { name: "error", type: "string", description: "Si esta presente, el Input se muestra en danger y oculta helper." },
      { name: "...InputProps", type: "-", description: "Hereda todas las props de Input (excepto hasError, que se calcula)." },
    ],
    snippet: `import { FormField } from "../components";

<FormField
  label="Correo electronico"
  value={email}
  onChangeText={setEmail}
  placeholder="tu@correo.cl"
  error={errors.email}
  keyboardType="email-address"
/>`,
  },
  {
    name: "RadioGroup",
    path: "molecules/RadioGroup",
    category: "molecules",
    description: "Grupo de opciones de seleccion unica con opciones grandes. Ideal para el cuestionario Likert.",
    variants: [
      { label: "5 opciones Likert", render: () => <RadioGroupDemo /> },
    ],
    props: [
      { name: "options", type: "ReadonlyArray<RadioOption<T>>", required: true, description: "{ value, label, disabled? }" },
      { name: "value", type: "T | null", required: true },
      { name: "onChange", type: "(v: T) => void", required: true },
      { name: "accessibilityLabel", type: "string", description: "Label del grupo entero." },
    ],
    snippet: `import { RadioGroup } from "../components";

<RadioGroup
  value={selected}
  onChange={setSelected}
  options={[
    { value: "strongly_agree", label: "Muy de acuerdo" },
    { value: "neutral", label: "Neutral" },
    { value: "strongly_disagree", label: "Muy en desacuerdo" },
  ]}
/>`,
  },
  {
    name: "WeightSelector",
    path: "molecules/WeightSelector",
    category: "molecules",
    description: "5 pills para elegir peso de una pregunta (1-5). Labels default: Nada/Poco/Medio/Alto/Mucho.",
    variants: [
      { label: "interactive", render: () => <WeightSelectorDemo /> },
      { label: "seleccionado en 4", render: () => <WeightSelector value={4} onChange={() => {}} /> },
      {
        label: "labels custom",
        render: () => (
          <WeightSelector
            value={3}
            onChange={() => {}}
            labels={{ 1: "No", 2: "Bajo", 3: "OK", 4: "Alto", 5: "Full" }}
          />
        ),
      },
    ],
    props: [
      { name: "value", type: "Weight | null", required: true, description: "1 | 2 | 3 | 4 | 5" },
      { name: "onChange", type: "(w: Weight) => void", required: true },
      { name: "labels", type: "Record<Weight, string>", description: "Default: Nada/Poco/Medio/Alto/Mucho." },
    ],
    snippet: `import { WeightSelector } from "../components";

<WeightSelector value={peso} onChange={setPeso} />`,
  },
  {
    name: "BookmarkActions",
    path: "molecules/BookmarkActions",
    category: "molecules",
    description: "Par de toggles favorito + descartar. 2 tamanos (sm chip, lg boton de 48px WCAG).",
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
    snippet: `import { BookmarkActions } from "../components";

<BookmarkActions
  isFavorito={candidato.isFavorito}
  isDescartado={candidato.isDescartado}
  onToggleFavorito={() => toggleFavorito(candidato.id)}
  onToggleDescartado={() => toggleDescartado(candidato.id)}
  loading={mutation.isPending}
  size="lg"
/>`,
  },
];
