/**
 * Tests unitarios para theme/utils.ts.
 *
 * Sin React, sin render, sin API. Solo input/output.
 */
import { withAlpha } from "./utils";

describe("withAlpha", () => {
  test("agrega dos chars hex al final del color con #", () => {
    expect(withAlpha("#FFFFFF", 1)).toBe("#FFFFFFff");
  });

  test("agrega dos chars hex al final del color sin #", () => {
    expect(withAlpha("FFFFFF", 1)).toBe("#FFFFFFff");
  });

  test("alpha 0 produce 00", () => {
    expect(withAlpha("#000000", 0)).toBe("#00000000");
  });

  test("alpha 0.5 produce 80 (128/255)", () => {
    // Math.round(0.5 * 255) = 128 = 0x80
    expect(withAlpha("#123456", 0.5)).toBe("#12345680");
  });

  test("alpha 0.13 (0x22 / 255 = 0.133) produce 21 (Math.round(0.13 * 255) = 33 = 0x21)", () => {
    // 0.13 * 255 = 33.15 -> round -> 33 = 0x21
    expect(withAlpha("#C89B5C", 0.13)).toBe("#C89B5C21");
  });

  test("alpha 0.09 (0x18 / 255 = 0.094) produce 17 (Math.round(0.09 * 255) = 23 = 0x17)", () => {
    // 0.09 * 255 = 22.95 -> round -> 23 = 0x17
    expect(withAlpha("#C89B5C", 0.09)).toBe("#C89B5C17");
  });

  test("clampea alpha > 1 a ff", () => {
    expect(withAlpha("#AABBCC", 1.5)).toBe("#AABBCCff");
  });

  test("clampea alpha < 0 a 00", () => {
    expect(withAlpha("#AABBCC", -0.5)).toBe("#AABBCC00");
  });

  test("padding de un solo char hex (ej. alpha=1/255)", () => {
    // Math.round(1/255 * 255) = 1 = 0x01
    expect(withAlpha("#000000", 1 / 255)).toBe("#00000001");
  });

  test("colores lowercase pasan intactos", () => {
    expect(withAlpha("#aabbcc", 1)).toBe("#aabbccff");
  });
});
