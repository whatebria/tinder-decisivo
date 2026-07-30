/**
 * Generador del catalogo del design system.
 *
 * Recorre src/components/{atoms,molecules,organisms,templates}/*.tsx,
 * busca los sibling *.showcase.tsx y emite un index.generated.ts con
 * imports estaticos + array exportado.
 *
 * Uso:
 *   node scripts/generate-catalog.js            (modo permisivo, avisa faltantes)
 *   node scripts/generate-catalog.js --strict   (falla si algun componente no tiene showcase)
 *   node scripts/generate-catalog.js --quiet    (suprime logs de info)
 *
 * Zero dependencias externas: solo fs + path. Debe correr en cualquier version
 * de Node >= 14 sin instalar nada. Es la puerta contra el drift.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const {
  REPO_ROOT,
  scanComponents,
  detectOrphans,
} = require("./lib/scan-components");

const OUT_FILE = path.join(
  REPO_ROOT,
  "src",
  "screens",
  "design-system",
  "catalog",
  "index.generated.ts",
);

const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const QUIET = args.includes("--quiet");

function log(msg) {
  if (!QUIET) console.log(msg);
}

function warn(msg) {
  if (!QUIET) console.warn(msg);
}

function buildImportAlias(entry, index) {
  const safe = entry.name.replace(/[^a-zA-Z0-9]/g, "_");
  return `showcase_${entry.category}_${safe}_${index}`;
}

function buildSource(entries) {
  const registered = entries.filter((e) => e.hasShowcase);

  const imports = registered
    .map((e, i) => {
      const alias = buildImportAlias(e, i);
      // index.generated.ts esta en src/screens/design-system/catalog/
      // components/ esta en src/components/
      // => 3 niveles arriba: catalog/ -> design-system/ -> screens/ -> src/
      const rel = `../../../components/${e.category}/${e.name}.showcase`;
      return `import ${alias} from "${rel}";`;
    })
    .join("\n");

  const items = registered
    .map((e, i) => {
      const alias = buildImportAlias(e, i);
      return [
        "  {",
        `    name: "${e.name}",`,
        `    category: "${e.category}",`,
        `    path: "${e.path}",`,
        `    sourcePath: "${e.componentRel}",`,
        `    ...${alias},`,
        "  },",
      ].join("\n");
    })
    .join("\n");

  return [
    "/**",
    " * ARCHIVO AUTOGENERADO por scripts/generate-catalog.js.",
    " * NO editar a mano: el proximo build lo pisa.",
    " *",
    " * Regenerar:   npm run catalog:generate",
    " * Validar:     npm run catalog:generate:strict",
    " *",
    " * Cada entry viene de un .showcase.tsx colocated junto al componente.",
    " */",
    "",
    'import type { CatalogEntry } from "../showcase/types";',
    imports,
    "",
    "export const generatedCatalog: CatalogEntry[] = [",
    items,
    "];",
    "",
  ].join("\n");
}

function main() {
  const entries = scanComponents();
  const registered = entries.filter((e) => e.hasShowcase);
  const missing = entries.filter((e) => !e.hasShowcase);
  const orphans = detectOrphans();

  // Los orphans siempre fallan: son inconsistencia real, no migracion en curso.
  if (orphans.length > 0) {
    console.error(
      `[generate-catalog] ERROR: ${orphans.length} showcase(s) huerfanos (sin componente hermano):`,
    );
    for (const o of orphans) console.error(`  - ${o}`);
    process.exit(2);
  }

  if (STRICT && missing.length > 0) {
    console.error(
      `[generate-catalog] STRICT: ${missing.length} componente(s) sin .showcase.tsx colocated:`,
    );
    for (const m of missing) console.error(`  - ${m.componentRel}`);
    console.error("");
    console.error("Crea el archivo hermano X.showcase.tsx o borra el componente.");
    process.exit(1);
  }

  const source = buildSource(entries);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, source, "utf8");

  const total = entries.length;
  log(`[generate-catalog] ${registered.length}/${total} entries generadas -> ${path.relative(REPO_ROOT, OUT_FILE)}`);
  if (missing.length > 0) {
    warn(
      `[generate-catalog] AVISO: ${missing.length} componente(s) todavia sin showcase (migracion en curso):`,
    );
    for (const m of missing) warn(`  - ${m.name} (${m.category})`);
  }
}

main();
