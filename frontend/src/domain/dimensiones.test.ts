/**
 * Tests del catalogo de dimensiones.
 *
 * El test critico: BLINDAJE DE CONTRASTE WCAG 2.2 AA. Verifica que cada
 * color de texto de cada dimension, en cada theme, tenga contraste >= 4.5
 * sobre el `gray100` del theme correspondiente (que es el fondo de la card
 * interna donde se renderiza el label). Si alguien cambia un hex a algo
 * ilegible, este test se pone rojo.
 *
 * Implementa la formula WCAG 2.x de relative luminance + contrast ratio.
 * No usamos libreria externa por 2 razones: (1) es ~15 lineas, (2) evita
 * dep transitiva solo-para-tests.
 */
import {
  DIMENSIONES,
  getDimension,
  getDimensionColors,
  type DimensionKey,
} from "./dimensiones";
import { colors, colorsDark } from "../theme/colors";

// ---- Helpers WCAG ---------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

// ---- Sanity ---------------------------------------------------------------

describe("catalogo DIMENSIONES", () => {
  test("tiene exactamente las 7 dimensiones esperadas", () => {
    const keys = DIMENSIONES.map((d) => d.key);
    expect(keys).toEqual([
      "economico",
      "social",
      "cultural",
      "ambiental",
      "institucional",
      "pueblos_originarios",
      "discapacidad",
    ]);
  });

  test("todas las dimensiones tienen label, icon, badge, text y border", () => {
    for (const d of DIMENSIONES) {
      expect(d.label).toBeTruthy();
      expect(d.icon).toBeTruthy();
      expect(d.badge).toMatch(/^#[0-9A-F]{6}$/i);
      expect(d.text.light).toMatch(/^#[0-9A-F]{6}$/i);
      expect(d.text.dark).toMatch(/^#[0-9A-F]{6}$/i);
      expect(d.border.light).toMatch(/^#[0-9A-F]{6}$/i);
      expect(d.border.dark).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  test("keys son unicas (no hay duplicados)", () => {
    const keys = DIMENSIONES.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ---- Contraste WCAG (el test que blinda el bug reportado) -----------------

describe("contraste WCAG 2.2 AA · texto de label sobre card interna", () => {
  // El label se renderiza sobre `c.gray100` (fondo de la DimensionCard).
  // Se testea en ambos themes.
  for (const dim of DIMENSIONES) {
    test(`${dim.key} · text.light sobre gray100 light cumple AA (>= 4.5)`, () => {
      const ratio = contrastRatio(dim.text.light, colors.gray100);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });

    test(`${dim.key} · text.dark sobre gray100 dark cumple AA (>= 4.5)`, () => {
      const ratio = contrastRatio(dim.text.dark, colorsDark.gray100);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});

describe("contraste WCAG 2.2 AA · texto blanco sobre badge circular", () => {
  // El chip circular tiene bg del color y texto blanco adentro.
  // Debe cumplir AA en ambos themes (el badge es el mismo hex en los dos).
  for (const dim of DIMENSIONES) {
    test(`${dim.key} · #FFFFFF sobre badge cumple AA (>= 4.5)`, () => {
      const ratio = contrastRatio("#FFFFFF", dim.badge);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});

describe("contraste WCAG 2.2 AA · border izquierdo (grafico, AA large 3.0)", () => {
  // El border es puramente visual (4px de ancho), aplica AA large (3.0).
  for (const dim of DIMENSIONES) {
    test(`${dim.key} · border.light sobre gray100 light cumple AA large`, () => {
      const ratio = contrastRatio(dim.border.light, colors.gray100);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
    });

    test(`${dim.key} · border.dark sobre gray100 dark cumple AA large`, () => {
      const ratio = contrastRatio(dim.border.dark, colorsDark.gray100);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
    });
  }
});

// ---- API pura -------------------------------------------------------------

describe("getDimension", () => {
  test("devuelve la definicion correcta por key", () => {
    const eco = getDimension("economico");
    expect(eco.label).toBe("Economico");
    expect(eco.icon).toBe("$");
  });

  test("todas las keys son accesibles", () => {
    const keys: DimensionKey[] = [
      "economico",
      "social",
      "cultural",
      "ambiental",
      "institucional",
      "pueblos_originarios",
      "discapacidad",
    ];
    for (const k of keys) {
      expect(getDimension(k).key).toBe(k);
    }
  });
});

describe("getDimensionColors", () => {
  test("en light devuelve las variantes light de text y border", () => {
    const dim = getDimension("cultural");
    const c = getDimensionColors("cultural", false);
    expect(c.text).toBe(dim.text.light);
    expect(c.border).toBe(dim.border.light);
    expect(c.badge).toBe(dim.badge);
  });

  test("en dark devuelve las variantes dark de text y border", () => {
    const dim = getDimension("cultural");
    const c = getDimensionColors("cultural", true);
    expect(c.text).toBe(dim.text.dark);
    expect(c.border).toBe(dim.border.dark);
    expect(c.badge).toBe(dim.badge); // badge NO cambia entre themes
  });

  test("el badge NUNCA cambia entre themes (invariante de diseno)", () => {
    for (const dim of DIMENSIONES) {
      const light = getDimensionColors(dim.key, false);
      const dark = getDimensionColors(dim.key, true);
      expect(light.badge).toBe(dark.badge);
    }
  });

  test("el text SI cambia entre themes para todas las dimensiones", () => {
    // Regla: dark siempre distinto de light (si no, hay un bug de config).
    for (const dim of DIMENSIONES) {
      const light = getDimensionColors(dim.key, false);
      const dark = getDimensionColors(dim.key, true);
      expect(light.text).not.toBe(dark.text);
    }
  });
});
