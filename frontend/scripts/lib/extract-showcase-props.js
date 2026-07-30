/**
 * Extractor de PropEntry[] declarados en un archivo .showcase.tsx.
 *
 * Un showcase valido tiene la forma:
 *   export default {
 *     description: "...",
 *     variants: [...],
 *     props: [
 *       { name: "variant", type: "\"a\" | \"b\"", required: true },
 *       { name: "size", type: "number", defaultValue: "12" },
 *     ],
 *     snippet: `...`,
 *   };
 *
 * Este modulo lee el AST y extrae SOLO los campos { name, required } de cada
 * PropEntry para poder cross-checkear contra la signature real del componente
 * (via extract-component-props.js).
 *
 * No se ejecuta codigo — solo parseo de AST. Cero riesgo de side-effects.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

/**
 * @typedef {Object} ShowcasePropRef
 * @property {string} name       Ej. "variant"
 * @property {boolean} required  true si la entry tiene `required: true`
 */

/**
 * @param {string} showcaseAbsPath
 * @returns {{ props: ShowcasePropRef[], found: boolean }}
 *   found=false si el archivo no exporta default o no tiene campo `props`.
 */
function extractShowcaseProps(showcaseAbsPath) {
  const src = fs.readFileSync(showcaseAbsPath, "utf8");
  const sourceFile = ts.createSourceFile(
    path.basename(showcaseAbsPath),
    src,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const defaultExport = findDefaultExportObject(sourceFile);
  if (!defaultExport) return { props: [], found: false };

  const propsProp = defaultExport.properties.find(
    (p) =>
      ts.isPropertyAssignment(p) &&
      p.name &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
      p.name.text === "props",
  );
  if (!propsProp || !ts.isPropertyAssignment(propsProp)) {
    return { props: [], found: false };
  }

  const arr = propsProp.initializer;
  if (!ts.isArrayLiteralExpression(arr)) {
    return { props: [], found: false };
  }

  const props = [];
  for (const elem of arr.elements) {
    if (!ts.isObjectLiteralExpression(elem)) continue;
    const nameProp = elem.properties.find(
      (p) =>
        ts.isPropertyAssignment(p) &&
        p.name &&
        (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
        p.name.text === "name",
    );
    if (!nameProp || !ts.isPropertyAssignment(nameProp)) continue;
    if (!ts.isStringLiteral(nameProp.initializer)) continue;
    const name = nameProp.initializer.text;

    const requiredProp = elem.properties.find(
      (p) =>
        ts.isPropertyAssignment(p) &&
        p.name &&
        (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
        p.name.text === "required",
    );
    let required = false;
    if (
      requiredProp &&
      ts.isPropertyAssignment(requiredProp) &&
      requiredProp.initializer.kind === ts.SyntaxKind.TrueKeyword
    ) {
      required = true;
    }

    props.push({ name, required });
  }

  return { props, found: true };
}

/**
 * Busca `export default { ... }` en el source file.
 * Soporta tambien `const x = {...}; export default x` (siguiendo la referencia).
 */
function findDefaultExportObject(sourceFile) {
  let objectFound = null;
  let identFound = null;

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isExportAssignment(node)) {
      if (ts.isObjectLiteralExpression(node.expression)) {
        objectFound = node.expression;
      } else if (ts.isIdentifier(node.expression)) {
        identFound = node.expression.text;
      }
    }
  });

  if (objectFound) return objectFound;

  if (identFound) {
    // Buscamos const NAME = {...}
    let indirect = null;
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (
            ts.isIdentifier(decl.name) &&
            decl.name.text === identFound &&
            decl.initializer &&
            ts.isObjectLiteralExpression(decl.initializer)
          ) {
            indirect = decl.initializer;
          }
        }
      }
    });
    return indirect;
  }

  return null;
}

/**
 * Compara props del componente con las declaradas en el showcase.
 *
 * @param {{name: string, required: boolean}[]} componentProps
 * @param {ShowcasePropRef[]} showcaseProps
 * @param {{ hasExtends?: boolean }} [opts]
 *   Si hasExtends=true, las props "extra" (en showcase pero no en la
 *   interface local) van a `heritable` en vez de `extra`, asumiendo que
 *   vienen heredadas de una interface base que no podemos resolver sin
 *   type-checker. Reduce falsos positivos manteniendo el check util.
 *
 * @returns {{
 *   extra: string[],            // en showcase pero no en componente (ERROR real)
 *   heritable: string[],        // en showcase, no en interface local pero componente extends algo (WARN)
 *   missing: string[],          // required en componente y faltan en showcase
 *   requiredMismatch: {name: string, component: boolean, showcase: boolean}[],
 * }}
 */
function diffProps(componentProps, showcaseProps, opts) {
  const hasExtends = !!(opts && opts.hasExtends);
  const compMap = new Map(componentProps.map((p) => [p.name, p]));
  const showMap = new Map(showcaseProps.map((p) => [p.name, p]));

  const extra = [];
  const heritable = [];
  for (const s of showcaseProps) {
    if (!compMap.has(s.name)) {
      if (hasExtends) heritable.push(s.name);
      else extra.push(s.name);
    }
  }

  const missing = [];
  for (const c of componentProps) {
    // Solo alarmamos por props REQUIRED faltantes en el showcase.
    // Las opcionales son OK omitir (showcase focused en lo esencial).
    if (c.required && !showMap.has(c.name)) missing.push(c.name);
  }

  const requiredMismatch = [];
  for (const s of showcaseProps) {
    const c = compMap.get(s.name);
    if (c && c.required !== s.required) {
      requiredMismatch.push({
        name: s.name,
        component: c.required,
        showcase: s.required,
      });
    }
  }

  return { extra, heritable, missing, requiredMismatch };
}

module.exports = { extractShowcaseProps, diffProps };
