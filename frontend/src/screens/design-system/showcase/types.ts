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

export type CatalogCategory = "tokens" | "atoms" | "molecules" | "organisms" | "templates" | "patterns";

/**
 * Estado del ciclo de vida de un componente.
 *   stable      — production-ready, API congelada.
 *   experimental — en uso pero API puede cambiar.
 *   deprecated  — existe por compatibilidad; usa la alternativa indicada.
 *   removed     — ya no existe en el codigo; entrada de referencia historica.
 */
export type ComponentStatus = "stable" | "experimental" | "deprecated" | "removed";

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
  /**
   * Override del path completo mostrado en el header.
   * Default: `src/components/{path}.tsx`. Usalo para tokens (`src/theme/{path}.ts`).
   */
  sourcePath?: string;

  // --- Metadatos opcionales (enriquecen el catalogo sin romper el auto-generador) ---

  /** Estado del ciclo de vida. Default: 'stable'. */
  status?: ComponentStatus;
  /**
   * Nombre del componente que reemplaza a este (solo cuando status='deprecated').
   * Ej: '"MatchTier" en organisms'.
   */
  deprecatedBy?: string;
  /** Cuando NO usar este componente. Guideline de uso negativo. */
  doNotUse?: string[];
  /** Notas de accesibilidad: roles, aria, contrastes, tamaños minimos. */
  a11y?: string[];
  /** Nombres de otros componentes relacionados (para navegacion cruzada). */
  relatedTo?: string[];
  /** Nombre del Design System token / guideline que gobierna este componente. */
  dsReference?: string;
}
