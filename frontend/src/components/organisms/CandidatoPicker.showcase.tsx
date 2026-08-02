/**
 * Showcase de CandidatoPicker.
 * Selector de candidato con sub-filtros internos de eleccion y partido.
 */

import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { CandidatoPicker } from "./CandidatoPicker";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo"
>;

const MOCK_CANDIDATOS = [
  { id: 1, nombre: "Ana", apellido: "Ramirez", partido: "Partido Verde", profile_picture: null },
  { id: 2, nombre: "Luis", apellido: "Torres", partido: "Partido Rojo", profile_picture: null },
  { id: 3, nombre: "Maria", apellido: "Gonzalez", partido: "Partido Verde", profile_picture: null },
  { id: 4, nombre: "Pedro", apellido: "Soto", partido: "Independiente", profile_picture: null },
] as any[];

const MOCK_TIPOS = [
  { id: 1, nombre: "Presidencial 2025", es_base: false },
  { id: 2, nombre: "Diputados D8", es_base: false },
] as any[];

function CandidatoPickerDemo() {
  const [selected, setSelected] = React.useState<number | null>(null);
  return (
    <CandidatoPicker
      candidatos={MOCK_CANDIDATOS}
      tiposEleccion={MOCK_TIPOS}
      selectedId={selected}
      onSelect={setSelected}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Selector de candidato con sub-filtros internos de eleccion y partido. Los sub-filtros son encapsulados: el padre solo recibe el ID final seleccionado. Usado en NoticiasScreen (sheet de filtros).",

  status: "stable",

  a11y: [
    "Los chips usan accessibilityRole='button' y accessibilityState={{ selected }} cuando estan activos.",
    "El candidato seleccionado debe tener un label descriptivo completo (nombre + partido).",
  ],

  doNotUse: [
    "No usar para seleccion multi-candidato — solo soporta selectedId unico.",
    "No duplicar la logica de sub-filtros en el parent — CandidatoPicker los gestiona internamente.",
    "No pasar candidatos sin tiposEleccion cuando quieras el sub-filtro de eleccion.",
  ],

  relatedTo: ["CandidatoPickerModal", "ChipActivo", "FilterBottomSheet"],

  variants: [
    {
      label: "interactivo (4 candidatos, 2 elecciones)",
      surface: "card",
      render: () => <CandidatoPickerDemo />,
    },
    {
      label: "sin candidatos",
      surface: "card",
      render: () => (
        <CandidatoPicker
          candidatos={[]}
          tiposEleccion={MOCK_TIPOS}
          selectedId={null}
          onSelect={() => {}}
        />
      ),
    },
  ],

  props: [
    { name: "candidatos", type: "Candidato[]", required: true, description: "Lista completa de candidatos a mostrar como chips." },
    { name: "tiposEleccion", type: "TipoEleccion[]", required: true, description: "Tipos de eleccion para el sub-filtro interno." },
    { name: "selectedId", type: "number | null", required: true, description: "ID del candidato actualmente seleccionado. null = todos." },
    { name: "onSelect", type: "(id: number | null) => void", required: true },
  ],

  snippet: `import { CandidatoPicker } from "@/components";

// En FilterBottomSheet de NoticiasScreen
<CandidatoPicker
  candidatos={candidatos}
  tiposEleccion={tiposEleccion}
  selectedId={filtros.candidatoId}
  onSelect={(id) => setFiltros((f) => ({ ...f, candidatoId: id }))}
/>`,
};

export default showcase;
