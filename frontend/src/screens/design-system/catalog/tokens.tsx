import type { CatalogEntry } from "../showcase/types";
import { colorsCatalog } from "./tokens/colors";
import { motionCatalog } from "./tokens/motion";
import { radiiCatalog } from "./tokens/radii";
import { shadowsCatalog } from "./tokens/shadows";
import { spacingCatalog } from "./tokens/spacing";
import { typographyCatalog } from "./tokens/typography";

/**
 * Catalogo de tokens del design system (colors, spacing, radii, shadows, typography, motion).
 * Orden: colores primero (mas visual), motion al final (interactivo).
 */
export const tokensCatalog: CatalogEntry[] = [
  ...colorsCatalog,
  ...typographyCatalog,
  ...spacingCatalog,
  ...radiiCatalog,
  ...shadowsCatalog,
  ...motionCatalog,
];
