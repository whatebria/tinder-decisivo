/**
 * Tokens de color: semanticos (light/dark) + grays + tints (60 shades por familia).
 */

import React from "react";
import { Text, View } from "react-native";

import { colors, colorsDark } from "../../../../theme/colors";
import { useThemeColors } from "../../../../theme/useTheme";
import type { CatalogEntry } from "../../showcase/types";
import { ColorSwatch } from "../../showcase/TokenPreviews";

// Semanticos: mismos keys en light y dark.
const SEMANTIC_KEYS = [
  "bg", "card", "accent", "accent2",
  "primary", "primaryHover", "secondary",
  "text", "textSecondary", "textTertiary", "textOnPrimary",
  "border", "border2",
  "success", "warning", "danger", "info",
] as const;

const GRAY_KEYS = [
  "gray50", "gray100", "gray200", "gray300", "gray400",
  "gray500", "gray600", "gray700", "gray800", "gray900",
] as const;

const TINT_FAMILIES = ["primary", "secondary", "success", "warning", "danger", "info"] as const;
const TINT_WEIGHTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function SectionLabel({ children }: { children: string }) {
  const c = useThemeColors();
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: c.textSecondary }}>
      {children}
    </Text>
  );
}

function SemanticsSideBySide() {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 24, flexWrap: "wrap" }}>
        <View style={{ gap: 8 }}>
          <SectionLabel>Light</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {SEMANTIC_KEYS.map((k) => (
              <ColorSwatch key={`l-${k}`} name={k} value={colors[k]} showContrast />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <SectionLabel>Dark</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {SEMANTIC_KEYS.map((k) => (
              <ColorSwatch key={`d-${k}`} name={k} value={colorsDark[k]} showContrast />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function GraysRow() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {GRAY_KEYS.map((k) => (
        <ColorSwatch key={k} name={k} value={colors[k]} />
      ))}
    </View>
  );
}

function TintFamily({ family }: { family: (typeof TINT_FAMILIES)[number] }) {
  const c = useThemeColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: c.text, textTransform: "capitalize" }}>{family}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TINT_WEIGHTS.map((w) => {
          const key = `${family}${w}` as keyof typeof colors;
          return <ColorSwatch key={key} name={`${family}${w}`} value={colors[key]} />;
        })}
      </View>
    </View>
  );
}

export const colorsCatalog: CatalogEntry[] = [
  {
    name: "Colors — Semanticos",
    path: "colors",
    sourcePath: "src/theme/colors.ts",
    category: "tokens",
    description: "Tokens semanticos que cambian con el theme (light/dark). Usa siempre estos en componentes — nunca hex hardcodeado. Acceso via useThemeColors().",
    variants: [{ label: "light vs dark", render: () => <SemanticsSideBySide /> }],
    props: [],
    snippet: `import { useThemeColors } from "../theme/useTheme";

function MyComponent() {
  const c = useThemeColors();
  return <View style={{ backgroundColor: c.card, borderColor: c.border }} />;
}`,
  },
  {
    name: "Colors — Grays",
    path: "colors",
    sourcePath: "src/theme/colors.ts",
    category: "tokens",
    description: "Escala neutra 50-900. En dark theme se invierten (gray50 sigue siendo 'el mas sutil').",
    variants: [{ label: "gray50 - gray900", render: () => <GraysRow /> }],
    props: [],
    snippet: `import { colors } from "../theme/colors";
// o mejor:
import { useThemeColors } from "../theme/useTheme";
const c = useThemeColors();
c.gray100`,
  },
  {
    name: "Colors — Tints",
    path: "colors",
    sourcePath: "src/theme/colors.ts",
    category: "tokens",
    description: "Escalas 50-900 por familia semantica. Valores absolutos (NO se invierten en dark). Usalos para variantes o estados custom.",
    variants: [
      { label: "primary", render: () => <TintFamily family="primary" /> },
      { label: "secondary", render: () => <TintFamily family="secondary" /> },
      { label: "success", render: () => <TintFamily family="success" /> },
      { label: "warning", render: () => <TintFamily family="warning" /> },
      { label: "danger", render: () => <TintFamily family="danger" /> },
      { label: "info", render: () => <TintFamily family="info" /> },
    ],
    props: [],
    snippet: `import { colors } from "../theme/colors";

// Usar un tint especifico (mismo valor en light y dark):
<View style={{ backgroundColor: colors.primary100 }} />`,
  },
];
