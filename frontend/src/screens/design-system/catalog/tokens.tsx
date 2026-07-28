import type { CatalogEntry } from "../showcase/types";
import { colorsCatalog } from "./tokens/colors";
import { dimensionesCatalog } from "./tokens/dimensiones";
import { motionCatalog } from "./tokens/motion";
import { radiiCatalog } from "./tokens/radii";
import { shadowsCatalog } from "./tokens/shadows";
import { spacingCatalog } from "./tokens/spacing";
import { typographyCatalog } from "./tokens/typography";

/**
 * Catalogo de tokens del design system (colors, dimensiones, spacing, radii,
 * shadows, typography, motion). Orden: colores primero (mas visual),
 * dimensiones despues (subset semantico del dominio), motion al final.
 */
export const tokensCatalog: CatalogEntry[] = [
  ...colorsCatalog,
  ...dimensionesCatalog,
  ...typographyCatalog,
  ...spacingCatalog,
  ...radiiCatalog,
  ...shadowsCatalog,
  ...motionCatalog,
];
