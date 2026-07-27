/**
 * Tokens de spacing: escala base 4px.
 */

import React from "react";
import { View } from "react-native";

import { spacing } from "../../../../theme/spacing";
import type { CatalogEntry } from "../../showcase/types";
import { ScaleBar } from "../../showcase/TokenPreviews";

const SPACING_KEYS = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8", "sp9"] as const;
const MAX_SP = Math.max(...SPACING_KEYS.map((k) => spacing[k]));

export const spacingCatalog: CatalogEntry[] = [
  {
    name: "Spacing",
    path: "spacing",
    sourcePath: "src/theme/spacing.ts",
    category: "tokens",
    description: "Escala base 4px. Default para gaps: sp3 (12) o sp4 (16). Padding generoso (sp6/sp7) en superficies interactivas grandes.",
    variants: [
      {
        label: "escala sp1 - sp9",
        render: () => (
          <View style={{ gap: 6, width: "100%", maxWidth: 460 }}>
            {SPACING_KEYS.map((k) => (
              <ScaleBar key={k} name={k} value={spacing[k]} maxValue={MAX_SP} />
            ))}
          </View>
        ),
      },
    ],
    props: [],
    snippet: `import { spacing } from "../theme/spacing";

<View style={{ padding: spacing.sp4, gap: spacing.sp3 }} />

// Regla: usar SIEMPRE el token (spacing.sp3), nunca el numero raw (12).`,
  },
];
