/**
 * Catalogo del design system.
 *
 * Fuente de verdad: cada componente real de src/components tiene una entry
 * aca con variantes visuales + props + snippet copy-paste.
 *
 * Cuando agregues un componente nuevo:
 *  1. Crealo en src/components/{atoms|molecules|organisms|templates}
 *  2. Agrega una entry en el archivo correspondiente (atoms.tsx, etc.)
 *  3. Se autopublica en /design-system al reload.
 */

import { atomsCatalog } from "./atoms";
import { moleculesCatalog } from "./molecules";
import { organismsCatalog } from "./organisms";
import { templatesCatalog } from "./templates";
import { tokensCatalog } from "./tokens";
import type { CatalogEntry } from "../showcase/types";

export const catalog: CatalogEntry[] = [
  ...tokensCatalog,
  ...atomsCatalog,
  ...moleculesCatalog,
  ...organismsCatalog,
  ...templatesCatalog,
];
