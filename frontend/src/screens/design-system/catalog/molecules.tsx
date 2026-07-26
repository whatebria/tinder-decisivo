import type { CatalogEntry } from "../showcase/types";
import { cardsCatalog } from "./molecules/cards";
import { formsMoleculesCatalog } from "./molecules/forms";
import { layoutMoleculesCatalog } from "./molecules/layout";
import { overlaysCatalog } from "./molecules/overlays";

/**
 * Catalogo completo de moleculas (22 componentes).
 * Agrupado en 4 sub-archivos por cohesion semantica.
 */
export const moleculesCatalog: CatalogEntry[] = [
  ...formsMoleculesCatalog,
  ...cardsCatalog,
  ...layoutMoleculesCatalog,
  ...overlaysCatalog,
];
