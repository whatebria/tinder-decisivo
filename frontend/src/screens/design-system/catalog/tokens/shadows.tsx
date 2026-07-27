/**
 * Tokens de shadows: 3 niveles (sm/md/lg) light + dark.
 */

import React from "react";
import { View } from "react-native";

import { shadows, shadowsDark } from "../../../../theme/shadows";
import type { CatalogEntry } from "../../showcase/types";
import { ShadowCard } from "../../showcase/TokenPreviews";

const SHADOW_META: Array<{ key: "shSm" | "shMd" | "shLg"; usage: string }> = [
  { key: "shSm", usage: "cards default, inputs" },
  { key: "shMd", usage: "cards flotantes, dropdowns" },
  { key: "shLg", usage: "modales, sheets" },
];

export const shadowsCatalog: CatalogEntry[] = [
  {
    name: "Shadows",
    path: "shadows",
    sourcePath: "src/theme/shadows.ts",
    category: "tokens",
    description: "3 niveles con tinte azul del texto (mas suaves que negro puro). En dark theme se usan mas opacas con negro puro. Acceso via useThemeShadows().",
    variants: [
      {
        label: "light",
        render: () => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, padding: 8 }}>
            {SHADOW_META.map((s) => (
              <ShadowCard key={s.key} name={s.key} style={shadows[s.key]} usage={s.usage} />
            ))}
          </View>
        ),
      },
      {
        label: "dark",
        render: () => (
          <View style={{ backgroundColor: "#0B1418", flexDirection: "row", flexWrap: "wrap", gap: 16, padding: 16, borderRadius: 8 }}>
            {SHADOW_META.map((s) => (
              <ShadowCard key={`d-${s.key}`} name={s.key} style={shadowsDark[s.key]} usage={s.usage} />
            ))}
          </View>
        ),
        surface: "bg",
      },
    ],
    props: [],
    snippet: `import { useThemeShadows } from "../theme/useTheme";

function Card() {
  const shadows = useThemeShadows();
  return <View style={{ ...shadows.shSm, backgroundColor: "white" }} />;
}

// Retorna { shSm, shMd, shLg } segun el theme activo.`,
  },
];
