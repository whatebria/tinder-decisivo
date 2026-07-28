/**
 * Tests unitarios puros para la logica de dimensiones de modales/sheets.
 *
 * Testea `computeModalDimensions` y `computeSheetDimensions` (funciones
 * puras). Los hooks (`useModalDimensions`, `useSheetDimensions`) son
 * thin wrappers de estas funciones + useWindowDimensions + useMemo, no
 * aportan valor testear el wiring.
 *
 * Corren en milisegundos, sin mocks, sin jsdom.
 */
import {
  computeModalDimensions,
  computeSheetDimensions,
} from "./useModalDimensions";
import { modalLayout, sheetLayout } from "../theme/layout";

describe("computeModalDimensions", () => {
  test("en pantalla chica (mobile) gana el ratio, no el cap", () => {
    // 640 * 0.9 = 576, cap 720 → ratio gana
    const dims = computeModalDimensions(640);
    expect(dims.maxHeight).toBe(640 * modalLayout.maxHeightRatio);
    expect(dims.maxHeight).toBeLessThan(modalLayout.maxHeightAbsolute);
  });

  test("en pantalla justo en el umbral el cap empieza a ganar", () => {
    // Umbral: viewport * ratio == cap → viewport = cap / ratio = 720 / 0.9 = 800
    const dims = computeModalDimensions(800);
    expect(dims.maxHeight).toBe(modalLayout.maxHeightAbsolute);
  });

  test("en pantalla grande (desktop) gana el cap absoluto", () => {
    // 1080 * 0.9 = 972, cap 720 → cap gana
    const dims = computeModalDimensions(1080);
    expect(dims.maxHeight).toBe(modalLayout.maxHeightAbsolute);
  });

  test("en pantalla muy grande (4K) el cap sigue siendo el limite", () => {
    const dims = computeModalDimensions(2160);
    expect(dims.maxHeight).toBe(modalLayout.maxHeightAbsolute);
  });

  test("maxWidth es constante e independiente del viewport", () => {
    expect(computeModalDimensions(640).maxWidth).toBe(modalLayout.maxWidth);
    expect(computeModalDimensions(1440).maxWidth).toBe(modalLayout.maxWidth);
    expect(computeModalDimensions(2160).maxWidth).toBe(modalLayout.maxWidth);
  });

  test("edge case: viewport 0 devuelve maxHeight 0 (sin crashear)", () => {
    // No deberia pasar en prod pero verifica que no explota.
    const dims = computeModalDimensions(0);
    expect(dims.maxHeight).toBe(0);
    expect(dims.maxWidth).toBe(modalLayout.maxWidth);
  });
});

describe("computeSheetDimensions", () => {
  test("aplica el ratio de sheets al alto de la ventana", () => {
    const dims = computeSheetDimensions(800);
    expect(dims.maxHeight).toBe(800 * sheetLayout.maxHeightRatio);
  });

  test("NO tiene cap absoluto: en pantalla enorme sigue escalando", () => {
    // Diferencia intencional con modales: los sheets ocupan mas alto en
    // desktop, no queremos capearlos.
    const dims = computeSheetDimensions(2160);
    expect(dims.maxHeight).toBe(2160 * sheetLayout.maxHeightRatio);
  });

  test("ratio de sheet es MAS restrictivo que el de modal", () => {
    // Regla de diseno: los bottom sheets dejan mas app visible detras.
    expect(sheetLayout.maxHeightRatio).toBeLessThan(modalLayout.maxHeightRatio);
  });
});
