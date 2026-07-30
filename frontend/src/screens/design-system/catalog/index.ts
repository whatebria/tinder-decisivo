/**
 * Catalogo del design system.
 *
 * Fuentes:
 *   1. tokensCatalog          — tokens del theme (colores, spacing, etc.)
 *      Se mantienen manuales porque no son componentes con props/render.
 *   2. generatedCatalog       — componentes, generado por scripts/generate-catalog.js
 *      a partir de los `.showcase.tsx` colocated en src/components/{cat}/.
 *
 * Para agregar un componente nuevo:
 *   1. Crea `src/components/{cat}/MiComponente.tsx`
 *   2. Crea `src/components/{cat}/MiComponente.showcase.tsx` al lado
 *   3. Corre `npm run catalog:generate` (o deja que el CI lo haga)
 *   4. Verifica props: `npm run catalog:verify-props`
 */

import type { CatalogEntry } from "../showcase/types";
import { generatedCatalog } from "./index.generated";
import { tokensCatalog } from "./tokens";

export const catalog: CatalogEntry[] = [
  ...tokensCatalog,
  ...generatedCatalog,
];
