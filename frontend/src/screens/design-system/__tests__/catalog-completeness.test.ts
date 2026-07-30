/**
 * Test de completitud del catalogo del design system.
 *
 * Verifica que:
 *   1. No hay showcases huerfanos (X.showcase.tsx sin X.tsx hermano) — SIEMPRE
 *   2. Cada showcase importa del componente hermano correcto — SIEMPRE
 *   3. Cada componente tiene un .showcase.tsx colocated — SOLO si CATALOG_STRICT=1
 *
 * El check 3 falla en modo strict (CI post-migracion) pero solo avisa en
 * dev local durante la fase de migracion incremental.
 *
 * Correr strict manual:
 *   CATALOG_STRICT=1 npm test -- catalog-completeness
 */

import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  scanComponents,
  detectOrphans,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../../../../scripts/lib/scan-components");

type ScannedComponent = {
  name: string;
  category: string;
  componentAbs: string;
  componentRel: string;
  showcaseAbs: string | null;
  showcaseRel: string | null;
  hasShowcase: boolean;
};

const STRICT = process.env.CATALOG_STRICT === "1";

describe("catalogo del design system - completitud", () => {
  const entries: ScannedComponent[] = scanComponents();
  const orphans: string[] = detectOrphans();
  const registered = entries.filter((e) => e.hasShowcase);
  const missing = entries.filter((e) => !e.hasShowcase);

  it("no debe haber .showcase.tsx sin componente hermano", () => {
    expect(orphans).toEqual([]);
  });

  it("cada showcase debe importar del componente hermano correcto", () => {
    const violations: string[] = [];
    for (const entry of registered) {
      if (!entry.showcaseAbs) continue;
      const source = fs.readFileSync(entry.showcaseAbs, "utf8");
      // El import esperado: from "./{name}" (relativo al mismo directorio)
      const expectedImport = `from "./${entry.name}"`;
      if (!source.includes(expectedImport)) {
        violations.push(
          `${entry.showcaseRel}: no importa desde "./${entry.name}"`,
        );
      }
    }
    expect(violations).toEqual([]);
  });

  (STRICT ? it : it.skip)(
    "todos los componentes deben tener .showcase.tsx colocated (strict)",
    () => {
      const missingRels = missing.map((m) => m.componentRel);
      expect(missingRels).toEqual([]);
    },
  );

  it("reporta metricas de cobertura (no falla)", () => {
    const total = entries.length;
    const covered = registered.length;
    const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
    // eslint-disable-next-line no-console
    console.log(
      `[catalog] cobertura: ${covered}/${total} (${pct}%) | strict=${STRICT ? "on" : "off"} | orphans=${orphans.length}`,
    );
    expect(total).toBeGreaterThan(0);
  });
});

describe("catalogo del design system - dedupe manual vs auto", () => {
  it("catalog final no tiene entries duplicadas (name + category)", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { catalog } = require("../catalog");
    const seen = new Map<string, number>();
    for (const entry of catalog) {
      const key = `${entry.category}/${entry.name}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    const duplicates = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => `${key} (x${count})`);
    expect(duplicates).toEqual([]);
  });
});
