/**
 * Showcase de FilterBottomSheet.
 * Scaffold reutilizable para sheets de filtros.
 * Encapsula pill de activos, body scrolleable y footer limpiar/aplicar.
 */

import React from "react";
import { Text } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { FilterBottomSheet } from "./FilterBottomSheet";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo"
>;

function FilterBottomSheetDemo({ active }: { active: number }) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <Text onPress={() => setOpen(true)} style={{ color: "#2E5F7E", marginBottom: 8 }}>
        {open ? "Sheet abierto (ver abajo)" : "Toca para abrir"}
      </Text>
      <FilterBottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        filtrosActivosCount={active}
        resultadosCount={42}
        onLimpiar={() => {}}
        title="Filtros"
      >
        <Text style={{ padding: 16, color: "#666" }}>
          Aqui van CollapsibleFilterSection, chips de partido, etc.
        </Text>
      </FilterBottomSheet>
    </>
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Scaffold de sheet de filtros. Pill '3 activos' en header (visible solo cuando filtrosActivosCount > 0), body scrolleable via BottomSheet, footer sticky con 'Limpiar todo' + 'Aplicar (N resultados)'. Los filtros reales van como children.",

  status: "stable",

  a11y: [
    "BottomSheet subyacente usa accessibilityViewIsModal={true} para aislar el foco.",
    "El boton 'Limpiar' debe tener accessibilityLabel='Limpiar todos los filtros'.",
    "El boton 'Aplicar' comunica cuantos resultados hay: 'Aplicar — 42 resultados'.",
  ],

  doNotUse: [
    "No reimplementar el scaffold de sheet de filtros en cada pantalla — usar este organismo.",
    "No pasar toda la logica de filtrado a FilterBottomSheet — solo el conteo y el limpiar. El filtrado ocurre en el screen.",
  ],

  relatedTo: ["BottomSheet", "CollapsibleFilterSection", "ChipActivo", "CandidatoPicker"],

  variants: [
    {
      label: "sin filtros activos",
      render: () => <FilterBottomSheetDemo active={0} />,
    },
    {
      label: "3 filtros activos (pill visible)",
      render: () => <FilterBottomSheetDemo active={3} />,
    },
  ],

  props: [
    { name: "visible", type: "boolean", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "filtrosActivosCount", type: "number", required: true, description: "Muestra el pill '3 activos' cuando > 0." },
    { name: "resultadosCount", type: "number", required: true, description: "Aparece en el boton 'Aplicar (N resultados)'." },
    { name: "onLimpiar", type: "() => void", required: true, description: "Limpia todos los filtros activos." },
    { name: "children", type: "ReactNode", required: true, description: "Secciones de filtros: CollapsibleFilterSection, chips, Input, etc." },
    { name: "title", type: "string", defaultValue: '"Filtros"', description: "Titulo del header del sheet." },
  ],

  snippet: `import { FilterBottomSheet } from "@/components";
import { CollapsibleFilterSection } from "@/components";

<FilterBottomSheet
  visible={filterOpen}
  onClose={() => setFilterOpen(false)}
  filtrosActivosCount={filtrosActivosCount}
  resultadosCount={filtered.length}
  onLimpiar={limpiarTodo}
>
  <CollapsibleFilterSection title="Partido" defaultOpen>
    {/* chips de partido */}
  </CollapsibleFilterSection>

  <CollapsibleFilterSection title="Eleccion">
    {/* chips de tipo de eleccion */}
  </CollapsibleFilterSection>
</FilterBottomSheet>`,
};

export default showcase;
