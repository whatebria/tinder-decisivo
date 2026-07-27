/**
 * Tokens de tipografia.
 */

import React from "react";
import { View } from "react-native";

import { typography } from "../../../../theme/typography";
import type { CatalogEntry } from "../../showcase/types";
import { TypeSample } from "../../showcase/TokenPreviews";

const TYPE_KEYS = ["display", "h1", "h2", "h3", "lead", "body", "small", "overline"] as const;

export const typographyCatalog: CatalogEntry[] = [
  {
    name: "Typography",
    path: "typography",
    sourcePath: "src/theme/typography.ts",
    category: "tokens",
    description: "Escala tipografica. System font stack (sin dependencias externas). Line-height 1.65 en body para lectura larga.",
    variants: [
      {
        label: "escala completa",
        render: () => (
          <View style={{ gap: 4 }}>
            {TYPE_KEYS.map((k) => (
              <TypeSample key={k} name={k} style={typography[k]} />
            ))}
          </View>
        ),
      },
    ],
    props: [],
    snippet: `import { typography } from "../theme/typography";

<Text style={typography.h1}>Titulo grande</Text>
<Text style={typography.body}>Parrafo de cuerpo con line-height comodo.</Text>

// Cheatsheet:
// display  -> hero / landing (34px, 700)
// h1       -> titulo de pantalla (28px, 700)
// h2       -> seccion (24px, 600)
// h3       -> subseccion (20px, 600)
// lead     -> intro / subtitulo (18px, 500)
// body     -> texto default (16px, 400)
// small    -> meta / caption (14px, 400)
// overline -> kicker uppercase (12px, tracked)`,
  },
];
