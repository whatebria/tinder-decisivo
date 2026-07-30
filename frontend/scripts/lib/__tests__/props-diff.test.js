/**
 * Test unitario de diffProps y extractShowcaseProps.
 *
 * Ejerce los escenarios que el CLI verify-props.js debe detectar en CI.
 * No depende de showcases reales — usa fixtures inline.
 */

/* eslint-env jest */

"use strict";

const path = require("path");
const {
  diffProps,
  extractShowcaseProps,
} = require("../extract-showcase-props");

describe("diffProps", () => {
  const componentProps = [
    { name: "children", required: true, typeText: "string" },
    { name: "variant", required: false, typeText: "\"primary\" | \"secondary\"" },
    { name: "size", required: false, typeText: "\"sm\" | \"md\"" },
    { name: "loading", required: false, typeText: "boolean" },
  ];

  it("caso limpio: showcase perfectamente alineado", () => {
    const showcaseProps = [
      { name: "children", required: true },
      { name: "variant", required: false },
      { name: "loading", required: false },
    ];
    const diff = diffProps(componentProps, showcaseProps);
    expect(diff).toEqual({
      extra: [],
      heritable: [],
      missing: [],
      requiredMismatch: [],
    });
  });

  it("detecta prop inventada en showcase (extra)", () => {
    const showcaseProps = [
      { name: "children", required: true },
      { name: "propInexistente", required: false },
    ];
    const diff = diffProps(componentProps, showcaseProps);
    expect(diff.extra).toEqual(["propInexistente"]);
    expect(diff.heritable).toEqual([]);
  });

  it("suaviza extras a heritable cuando el componente tiene extends", () => {
    const showcaseProps = [
      { name: "children", required: true },
      { name: "onPress", required: false }, // heredada de PressableProps
    ];
    const diff = diffProps(componentProps, showcaseProps, { hasExtends: true });
    expect(diff.extra).toEqual([]);
    expect(diff.heritable).toEqual(["onPress"]);
  });

  it("detecta prop REQUIRED del componente ausente en showcase", () => {
    const showcaseProps = [
      { name: "variant", required: false },
    ];
    const diff = diffProps(componentProps, showcaseProps);
    expect(diff.missing).toEqual(["children"]);
  });

  it("no alarma por props opcionales omitidas en showcase (showcase focused)", () => {
    const showcaseProps = [
      { name: "children", required: true },
    ];
    const diff = diffProps(componentProps, showcaseProps);
    expect(diff.missing).toEqual([]);
  });

  it("detecta required mismatch (componente=required, showcase=optional)", () => {
    const showcaseProps = [
      { name: "children", required: false }, // MAL: componente lo pide required
    ];
    const diff = diffProps(componentProps, showcaseProps);
    expect(diff.requiredMismatch).toEqual([
      { name: "children", component: true, showcase: false },
    ]);
  });
});

describe("extractShowcaseProps", () => {
  const fixture = path.join(__dirname, "..", "__fixtures__", "Button.showcase.tsx");

  it("extrae name + required de cada PropEntry del default export", () => {
    const result = extractShowcaseProps(fixture);
    expect(result.found).toBe(true);
    expect(result.props).toEqual([
      { name: "children", required: true },
      { name: "variant", required: false },
      { name: "loading", required: false },
      { name: "onPress", required: false },
    ]);
  });
});
