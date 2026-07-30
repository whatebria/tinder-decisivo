/**
 * Modulo compartido de escaneo de componentes.
 *
 * Fuente de verdad unica para:
 *   - scripts/generate-catalog.js (produce index.generated.ts)
 *   - scripts/verify-props.js     (verifica PropEntry vs signature real)
 *   - src/screens/design-system/__tests__/catalog-completeness.test.ts
 *
 * Zero dependencias externas: solo fs + path.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "src", "components");
const CATEGORIES = ["atoms", "molecules", "organisms", "templates"];

/**
 * @typedef {Object} ScannedComponent
 * @property {string} name           Ej. "Button"
 * @property {string} category       "atoms" | "molecules" | "organisms" | "templates"
 * @property {string} path           Ej. "atoms/Button"
 * @property {string} componentRel   Ruta relativa POSIX al .tsx del componente
 * @property {string} componentAbs   Ruta absoluta al .tsx del componente
 * @property {string|null} showcaseRel Ruta relativa POSIX al .showcase.tsx, o null
 * @property {string|null} showcaseAbs Ruta absoluta al .showcase.tsx, o null
 * @property {boolean} hasShowcase
 */

/**
 * @returns {ScannedComponent[]}
 */
function scanComponents() {
  const entries = [];
  for (const category of CATEGORIES) {
    const dir = path.join(COMPONENTS_DIR, category);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith(".tsx")) continue;
      if (file.endsWith(".test.tsx")) continue;
      if (file.endsWith(".showcase.tsx")) continue;
      if (file === "index.tsx") continue;

      const name = file.replace(/\.tsx$/, "");
      const componentAbs = path.join(dir, file);
      const showcaseFile = `${name}.showcase.tsx`;
      const showcaseAbs = path.join(dir, showcaseFile);
      const hasShowcase = fs.existsSync(showcaseAbs);

      entries.push({
        name,
        category,
        path: `${category}/${name}`,
        componentAbs,
        componentRel: path.posix.join("src", "components", category, file),
        showcaseAbs: hasShowcase ? showcaseAbs : null,
        showcaseRel: hasShowcase
          ? path.posix.join("src", "components", category, showcaseFile)
          : null,
        hasShowcase,
      });
    }
  }
  return entries;
}

/**
 * Detecta showcase files sin componente hermano.
 * @returns {string[]} rutas POSIX relativas a REPO_ROOT
 */
function detectOrphans() {
  const orphans = [];
  for (const category of CATEGORIES) {
    const dir = path.join(COMPONENTS_DIR, category);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".showcase.tsx")) continue;
      const base = file.replace(/\.showcase\.tsx$/, "");
      const componentAbs = path.join(dir, `${base}.tsx`);
      if (!fs.existsSync(componentAbs)) {
        orphans.push(path.posix.join("src", "components", category, file));
      }
    }
  }
  return orphans;
}

module.exports = {
  REPO_ROOT,
  COMPONENTS_DIR,
  CATEGORIES,
  scanComponents,
  detectOrphans,
};
