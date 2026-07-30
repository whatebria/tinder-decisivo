/**
 * Extractor de props declaradas en un componente React.
 *
 * Usa TypeScript Compiler API (ya instalada en el proyecto, cero deps nuevas)
 * para parsear el AST del archivo y extraer las interfaces/types cuyo nombre
 * termina en "Props".
 *
 * LIMITACION conocida:
 *   Solo lee las props declaradas LOCALMENTE en el archivo. Props heredadas
 *   via `extends Foo` o `Omit<X, ...>` no se resuelven (requeriria full
 *   type-checker + resolver deps de react-native).
 *
 *   En la practica: los showcases documentan las props especificas del
 *   componente (variant, size, loading, etc), no las heredadas de RN
 *   (Pressable, View). La limitacion es aceptable.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

/**
 * @typedef {Object} PropInfo
 * @property {string} name           Ej. "variant"
 * @property {boolean} required      true si NO tiene `?`
 * @property {string} typeText       Texto crudo del tipo, tal como aparece en el .tsx
 */

/**
 * @typedef {Object} ComponentPropsInfo
 * @property {string} interfaceName  Ej. "ButtonProps"
 * @property {PropInfo[]} props
 * @property {string[]} extendsClauses  Ej. ['Omit<PressableProps, "children" | "style">']
 */

/**
 * @param {string} componentAbsPath
 * @returns {ComponentPropsInfo | null}
 */
function extractProps(componentAbsPath) {
  const src = fs.readFileSync(componentAbsPath, "utf8");
  const sourceFile = ts.createSourceFile(
    path.basename(componentAbsPath),
    src,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const componentName = path.basename(componentAbsPath, ".tsx");
  const preferredNames = [
    `${componentName}Props`,
    `${componentName}Properties`,
  ];

  // Index interfaces por nombre para resolver refs dentro de unions/intersections.
  /** @type {Map<string, ts.InterfaceDeclaration>} */
  const interfaceIndex = new Map();
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) interfaceIndex.set(node.name.text, node);
  });

  /** @type {ComponentPropsInfo[]} */
  const candidates = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      if (!name.endsWith("Props") && !name.endsWith("Properties")) return;
      candidates.push({
        interfaceName: name,
        props: readInterfaceMembers(node.members, src),
        extendsClauses: readExtendsClauses(node, src),
        isUnion: false,
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      if (!name.endsWith("Props") && !name.endsWith("Properties")) return;

      // Caso union: type XProps = A | B | C.
      // Extraemos union de todas las branches (fusion de props, marcadas como opcionales).
      if (ts.isUnionTypeNode(node.type)) {
        const unionProps = mergeUnionBranches(node.type, interfaceIndex, src);
        candidates.push({
          interfaceName: name,
          props: unionProps,
          extendsClauses: [],
          isUnion: true,
        });
        return;
      }

      // Caso literal/intersection: type XProps = { ... } | type XProps = A & { ... }
      const members = collectTypeLiteralMembers(node.type);
      if (members.length === 0) return;
      candidates.push({
        interfaceName: name,
        props: readInterfaceMembers(members, src),
        extendsClauses: readExtendsFromIntersection(node.type, src),
        isUnion: false,
      });
    }
  });

  if (candidates.length === 0) return null;

  // Preferir XProps donde X es el nombre del archivo.
  for (const preferred of preferredNames) {
    const hit = candidates.find((c) => c.interfaceName === preferred);
    if (hit) return hit;
  }
  // Si hay solo una interface *Props, esa es.
  if (candidates.length === 1) return candidates[0];
  // Ambiguo: devolvemos la primera y avisamos.
  return candidates[0];
}

/**
 * Fusiona todas las branches de una union type en un unico set de props.
 * Cada branch puede ser: TypeReference (ej. ActionProps) o TypeLiteral.
 * Props que no esten en TODAS las branches se marcan como opcionales.
 */
function mergeUnionBranches(unionNode, interfaceIndex, src) {
  const branches = [];
  for (const branch of unionNode.types) {
    const members = resolveBranchMembers(branch, interfaceIndex);
    if (members.length === 0) continue;
    branches.push(readInterfaceMembers(members, src));
  }
  if (branches.length === 0) return [];

  // Merge: prop existe si aparece en alguna branch. required=true solo si aparece en TODAS y en todas es required.
  /** @type {Map<string, PropInfo>} */
  const byName = new Map();
  for (const branchProps of branches) {
    for (const p of branchProps) {
      if (!byName.has(p.name)) byName.set(p.name, { ...p });
    }
  }
  for (const [name, merged] of byName) {
    const inAll = branches.every((b) => b.some((p) => p.name === name));
    const requiredInAll = inAll && branches.every((b) => b.find((p) => p.name === name)?.required);
    merged.required = requiredInAll;
  }
  return Array.from(byName.values());
}

/**
 * Resuelve una branch de una union a sus PropertySignature members.
 * Soporta: TypeReference a interface local, TypeLiteral, IntersectionType.
 * Sigue extends recursivamente para juntar todo lo declarado localmente.
 */
function resolveBranchMembers(node, interfaceIndex) {
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const target = interfaceIndex.get(node.typeName.text);
    if (!target) return [];
    const own = [...target.members];
    // Seguir extends para incluir CommonProps u otras bases locales.
    for (const clause of target.heritageClauses || []) {
      for (const type of clause.types) {
        if (ts.isIdentifier(type.expression)) {
          const base = interfaceIndex.get(type.expression.text);
          if (base) own.push(...base.members);
        }
      }
    }
    return own;
  }
  if (ts.isTypeLiteralNode(node)) return [...node.members];
  if (ts.isIntersectionTypeNode(node)) {
    const out = [];
    for (const t of node.types) out.push(...resolveBranchMembers(t, interfaceIndex));
    return out;
  }
  return [];
}

function readInterfaceMembers(members, src) {
  const props = [];
  for (const member of members) {
    if (!ts.isPropertySignature(member)) continue;
    if (!member.name) continue;
    const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
      ? member.name.text
      : null;
    if (!name) continue;
    const required = !member.questionToken;
    const typeText = member.type ? src.slice(member.type.pos, member.type.end).trim() : "unknown";
    props.push({ name, required, typeText });
  }
  return props;
}

function collectTypeLiteralMembers(typeNode) {
  if (!typeNode) return [];
  if (ts.isTypeLiteralNode(typeNode)) return typeNode.members;
  if (ts.isIntersectionTypeNode(typeNode)) {
    const out = [];
    for (const t of typeNode.types) {
      out.push(...collectTypeLiteralMembers(t));
    }
    return out;
  }
  return [];
}

function readExtendsClauses(interfaceNode, src) {
  const out = [];
  const heritage = interfaceNode.heritageClauses || [];
  for (const clause of heritage) {
    for (const type of clause.types) {
      out.push(src.slice(type.pos, type.end).trim());
    }
  }
  return out;
}

function readExtendsFromIntersection(typeNode, src) {
  if (!typeNode || !ts.isIntersectionTypeNode(typeNode)) return [];
  const out = [];
  for (const t of typeNode.types) {
    if (!ts.isTypeLiteralNode(t)) {
      out.push(src.slice(t.pos, t.end).trim());
    }
  }
  return out;
}

module.exports = { extractProps };
