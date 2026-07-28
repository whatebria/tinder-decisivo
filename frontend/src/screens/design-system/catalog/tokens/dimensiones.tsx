/**
 * Tokens de dimensiones tematicas del dominio.
 *
 * Muestra los 5 colores (economico, social, cultural, ambiental, institucional)
 * en sus variantes light y dark, con el contraste WCAG AA calculado en vivo
 * sobre el gray100 del theme correspondiente. Ademas ejemplos de uso via
 * DimensionBadge (chip circular) y DimensionCard (card completa).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  DIMENSIONES,
  type DimensionKey,
} from "../../../../domain/dimensiones";
import { DimensionBadge } from "../../../../components/atoms/DimensionBadge";
import { DimensionCard } from "../../../../components/molecules/DimensionCard";
import { colors, colorsDark } from "../../../../theme/colors";
import { useThemeColors } from "../../../../theme/useTheme";
import type { CatalogEntry } from "../../showcase/types";

// ---- Helpers WCAG (mismos que en dimensiones.test.ts) --------------------

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
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// ---- Componentes de preview ----------------------------------------------

function DimensionRow({
  dimension,
  mode,
}: {
  dimension: (typeof DIMENSIONES)[number];
  mode: "light" | "dark";
}) {
  const bg = mode === "light" ? colors.gray100 : colorsDark.gray100;
  const textColor = mode === "light" ? dimension.text.light : dimension.text.dark;
  const ratio = contrastRatio(textColor, bg);
  const passes = ratio >= 4.5;

  return (
    <View style={[styles.dimRow, { backgroundColor: bg }]}>
      <DimensionBadge dimension={dimension.key} size="md" />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={[styles.dimLabel, { color: textColor }]}>
          {dimension.label}
        </Text>
        <Text style={[styles.dimMeta, { color: textColor, opacity: 0.85 }]}>
          {textColor.toUpperCase()} · {ratio.toFixed(2)}:1 {passes ? "AA" : "FAIL"}
        </Text>
      </View>
    </View>
  );
}

function AllDimensionsSideBySide() {
  const c = useThemeColors();
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 24, flexWrap: "wrap" }}>
        <View style={{ flex: 1, minWidth: 240, gap: 8 }}>
          <Text style={[styles.mode, { color: c.textSecondary }]}>LIGHT</Text>
          {DIMENSIONES.map((d) => (
            <DimensionRow key={`l-${d.key}`} dimension={d} mode="light" />
          ))}
        </View>
        <View style={{ flex: 1, minWidth: 240, gap: 8 }}>
          <Text style={[styles.mode, { color: c.textSecondary }]}>DARK</Text>
          {DIMENSIONES.map((d) => (
            <DimensionRow key={`d-${d.key}`} dimension={d} mode="dark" />
          ))}
        </View>
      </View>
    </View>
  );
}

function BadgeShowcase() {
  return (
    <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
      {DIMENSIONES.map((d) => (
        <DimensionBadge key={d.key} dimension={d.key} size="md" />
      ))}
    </View>
  );
}

function CardShowcase() {
  const examples: Array<[DimensionKey, string]> = [
    ["economico", "Impacto en gasto publico y presion tributaria."],
    ["institucional", "Fortalece o debilita instituciones existentes."],
    ["ambiental", "Efecto sobre ecosistemas y recursos naturales."],
  ];
  return (
    <View>
      {examples.map(([key, texto]) => (
        <DimensionCard key={key} dimension={key}>
          {texto}
        </DimensionCard>
      ))}
    </View>
  );
}

// ---- Styles ---------------------------------------------------------------

const styles = StyleSheet.create({
  mode: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
  },
  dimLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  dimMeta: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});

// ---- Catalog entries -----------------------------------------------------

export const dimensionesCatalog: CatalogEntry[] = [
  {
    name: "Dimensiones — Paleta",
    path: "domain/dimensiones",
    sourcePath: "src/domain/dimensiones.ts",
    category: "tokens",
    description:
      "5 ejes tematicos del dominio (economico, social, cultural, ambiental, institucional). Cada uno tiene una variante light y una dark del texto/borde, ambas verificadas WCAG AA (ratio >= 4.5) sobre gray100. El chip color (badge) es invariante entre themes porque el texto blanco encima siempre cumple AA. Estos colores NO son tokens de UI (no reemplazan a primary/danger); son tokens de DOMINIO — mantienen la identidad semantica de cada dimension independiente del theme.",
    variants: [
      {
        label: "5 dimensiones · light vs dark · contraste en vivo",
        render: () => <AllDimensionsSideBySide />,
      },
    ],
    props: [],
    snippet: `import { useDimensionColors } from "../hooks/useDimensionColors";
import type { DimensionKey } from "../domain/dimensiones";

function MyLabel({ dim }: { dim: DimensionKey }) {
  const colors = useDimensionColors(dim);
  return <Text style={{ color: colors.text }}>Hola</Text>;
}`,
  },
  {
    name: "Dimensiones — Uso via DimensionBadge",
    path: "atoms/DimensionBadge",
    sourcePath: "src/components/atoms/DimensionBadge.tsx",
    category: "tokens",
    description:
      "Consumir los tokens de dimension via el atomo DimensionBadge (chip circular con icono). No hardcodees los hex.",
    variants: [{ label: "las 5 dimensiones", render: () => <BadgeShowcase /> }],
    props: [],
    snippet: `import { DimensionBadge } from "../components";

<DimensionBadge dimension="economico" size="md" />`,
  },
  {
    name: "Dimensiones — Uso via DimensionCard",
    path: "molecules/DimensionCard",
    sourcePath: "src/components/molecules/DimensionCard.tsx",
    category: "tokens",
    description:
      "Card completa: borde izquierdo del color + header con badge + label + body. Consumida por PreguntaInfoModal en la seccion de repercusiones.",
    variants: [{ label: "3 ejemplos", render: () => <CardShowcase /> }],
    props: [],
    snippet: `import { DimensionCard } from "../components";

<DimensionCard dimension="ambiental">
  Efecto sobre ecosistemas y recursos naturales.
</DimensionCard>`,
  },
];
