/**
 * Tokens de radii.
 */

import React from "react";
import { View } from "react-native";

import { radii } from "../../../../theme/radii";
import type { CatalogEntry } from "../../showcase/types";
import { RadiusBox } from "../../showcase/TokenPreviews";

const RADII_KEYS = ["rSm", "rMd", "rLg", "rXl", "rFull"] as const;

export const radiiCatalog: CatalogEntry[] = [
  {
    name: "Radii",
    path: "radii",
    sourcePath: "src/theme/radii.ts",
    category: "tokens",
    description: "Radios de esquina. Curvas suaves para sensacion no-agresiva. rFull para chips, badges y avatars.",
    variants: [
      {
        label: "todos",
        render: () => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            {RADII_KEYS.map((k) => (
              <RadiusBox key={k} name={k} value={radii[k]} />
            ))}
          </View>
        ),
      },
    ],
    props: [],
    snippet: `import { radii } from "../theme/radii";

<View style={{ borderRadius: radii.rLg }} />

// Cheatsheet:
// rSm (6)   -> inputs, buttons chicos
// rMd (10)  -> chips, cards chicas
// rLg (14)  -> cards principales, modales
// rXl (20)  -> hero cards, sheets
// rFull     -> avatars, badges pill`,
  },
];
