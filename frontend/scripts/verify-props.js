/**
 * Verificador de PropEntry[] de los showcases contra la signature real de
 * cada componente.
 *
 * Corre para cada .showcase.tsx existente:
 *   1. Extrae PropEntry[] del showcase (name + required)
 *   2. Extrae Props interface del componente hermano
 *   3. Compara y reporta divergencias
 *
 * Uso:
 *   node scripts/verify-props.js              (falla si hay divergencias reales)
 *   node scripts/verify-props.js --warn-only  (siempre exit 0, para reportes)
 *
 * Zero deps: solo usa modulos locales + TypeScript API (ya instalada).
 */

"use strict";

const path = require("path");
const {
  REPO_ROOT,
  scanComponents,
} = require("./lib/scan-components");
const { extractProps } = require("./lib/extract-component-props");
const {
  extractShowcaseProps,
  diffProps,
} = require("./lib/extract-showcase-props");

const args = process.argv.slice(2);
const WARN_ONLY = args.includes("--warn-only");
const QUIET = args.includes("--quiet");

function log(msg) {
  if (!QUIET) console.log(msg);
}

function main() {
  const entries = scanComponents();
  const withShowcase = entries.filter((e) => e.hasShowcase);

  if (withShowcase.length === 0) {
    log("[verify-props] No hay showcases todavia — skipping.");
    process.exit(0);
  }

  let hardErrors = 0;
  let softWarnings = 0;
  let checked = 0;

  for (const entry of withShowcase) {
    const componentInfo = extractProps(entry.componentAbs);
    if (!componentInfo) {
      log(`[verify-props] SKIP ${entry.componentRel}: sin interface *Props exportable`);
      continue;
    }

    const showcaseInfo = extractShowcaseProps(entry.showcaseAbs);
    if (!showcaseInfo.found) {
      log(`[verify-props] SKIP ${entry.showcaseRel}: no exporta default con campo props[]`);
      continue;
    }

    const hasExtends = componentInfo.extendsClauses.length > 0;
    const diff = diffProps(componentInfo.props, showcaseInfo.props, { hasExtends });
    checked++;

    const problems = [];
    if (diff.extra.length > 0) {
      problems.push(`  extra en showcase (no existen en ${componentInfo.interfaceName}): ${diff.extra.join(", ")}`);
      hardErrors++;
    }
    if (diff.missing.length > 0) {
      problems.push(`  required en componente sin doc en showcase: ${diff.missing.join(", ")}`);
      hardErrors++;
    }
    if (diff.requiredMismatch.length > 0) {
      const s = diff.requiredMismatch
        .map((m) => `${m.name} (componente=${m.component ? "required" : "optional"}, showcase=${m.showcase ? "required" : "optional"})`)
        .join(", ");
      problems.push(`  required mismatch: ${s}`);
      hardErrors++;
    }
    if (diff.heritable.length > 0) {
      log(`[verify-props] NOTE ${entry.showcaseRel}: props heredadas (via ${componentInfo.extendsClauses.join(", ")}): ${diff.heritable.join(", ")}`);
      softWarnings++;
    }

    if (problems.length > 0) {
      console.error(`[verify-props] FAIL ${entry.showcaseRel}:`);
      for (const p of problems) console.error(p);
    }
  }

  const rel = path.relative(REPO_ROOT, __dirname);
  log(`[verify-props] ${checked} showcase(s) verificado(s) | errores: ${hardErrors} | warnings suaves: ${softWarnings}`);

  if (hardErrors > 0 && !WARN_ONLY) {
    process.exit(1);
  }
  process.exit(0);
}

main();
