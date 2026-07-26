import type { CatalogEntry } from "../showcase/types";
import { buttonsCatalog } from "./atoms/buttons";
import { displayCatalog } from "./atoms/display";
import { feedbackCatalog } from "./atoms/feedback";
import { formsCatalog } from "./atoms/forms";

/**
 * Catalogo completo de atomos (27 componentes).
 * Agrupado en 4 sub-archivos por cohesion semantica.
 */
export const atomsCatalog: CatalogEntry[] = [
  ...buttonsCatalog,
  ...formsCatalog,
  ...feedbackCatalog,
  ...displayCatalog,
];
