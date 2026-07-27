/**
 * Tokens de motion: duraciones + easing.
 */

import React from "react";
import { View } from "react-native";

import { motion } from "../../../../theme/motion";
import type { CatalogEntry } from "../../showcase/types";
import { MotionSample } from "../../showcase/TokenPreviews";

const MOTION_KEYS = ["durFast", "durBase", "durSlow"] as const;

export const motionCatalog: CatalogEntry[] = [
  {
    name: "Motion",
    path: "motion",
    sourcePath: "src/theme/motion.ts",
    category: "tokens",
    description: "Duraciones para animaciones. Easing standard = bezier(0.4, 0, 0.2, 1) (Material). Toca 'Play' para ver la duracion en vivo.",
    variants: [
      {
        label: "3 duraciones",
        render: () => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {MOTION_KEYS.map((k) => (
              <MotionSample key={k} name={k} duration={motion[k]} />
            ))}
          </View>
        ),
      },
    ],
    props: [],
    snippet: `import { motion, easeBezier } from "../theme/motion";
import { Easing } from "react-native";

Animated.timing(value, {
  toValue: 1,
  duration: motion.durBase,
  easing: Easing.bezier(...easeBezier),
  useNativeDriver: true,
}).start();

// Cheatsheet:
// durFast (120ms) -> micro-interacciones (hover, press)
// durBase (180ms) -> UI standard (fades, slides)
// durSlow (320ms) -> transiciones de pantalla, modales`,
  },
];
