/**
 * Tipos del design system browser interno.
 *
 * Cada componente del catalogo se describe con un `CatalogEntry`:
 *  - variantes visuales (renders lado a lado)
 *  - tabla de props documentada manualmente
 *  - snippet copy-paste
 *
 * Todo se resuelve en runtime — nada de codegen ni parseo TS.
 */

import type { ReactNode } from "react";

export type CatalogCategory = "atoms" | "molecules" | "organisms" | "templates";

export interface PropEntry {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface VariantEntry {
  label: string;
  render: () => ReactNode;
  /** Opcional: contenedor con background (ej. "card" para componentes translucidos). */
  surface?: "bg" | "card";
}

export interface CatalogEntry {
  /** Nombre del componente (ej. "Button"). */
  name: string;
  /** Ruta desde src/components (ej. "atoms/Button"). */
  path: string;
  category: CatalogCategory;
  /** Descripcion breve (1-2 oraciones). */
  description: string;
  /** Variantes visuales a renderizar. */
  variants: VariantEntry[];
  /** Props documentadas. Al menos las que el consumer necesita saber. */
  props: PropEntry[];
  /** Snippet copy-paste con imports + JSX minimo. */
  snippet: string;
}
