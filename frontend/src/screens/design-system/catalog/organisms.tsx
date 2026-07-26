import type { CatalogEntry } from "../showcase/types";
import { candidateOrgCatalog } from "./organisms/candidate";
import { feedsCatalog } from "./organisms/feeds";
import { navShellCatalog } from "./organisms/nav-shell";

/**
 * Catalogo completo de organismos (18 componentes).
 * Agrupado en 3 sub-archivos por cohesion semantica.
 */
export const organismsCatalog: CatalogEntry[] = [
  ...navShellCatalog,
  ...candidateOrgCatalog,
  ...feedsCatalog,
];
