/**
 * DimensionBadge: chip circular con el icono de una dimension tematica.
 *
 * Atomo reusable: dado un `dimension` key, resuelve el color de fondo
 * (badge, invariante entre themes) y el icono desde el catalogo de
 * `src/domain/dimensiones.ts`. El texto interior es siempre blanco (chequeado
 * WCAG AA en `dimensiones.test.ts` para los 5 colores).
 *
 * Uso tipico:
 *   <DimensionBadge dimension="economico" />          // 24x24 default
 *   <DimensionBadge dimension="social" size="sm" />   // 18x18 compacto
 *   <DimensionBadge dimension="cultural" size="lg" /> // 32x32 header
 *
 * Consumidores: DimensionCard, futuros filters/badges de dimension.
 */
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { getDimension, type DimensionKey } from "../../domain/dimensiones";

export type DimensionBadgeSize = "sm" | "md" | "lg";

export interface DimensionBadgeProps {
  dimension: DimensionKey;
  size?: DimensionBadgeSize;
  /** Estilo custom del contenedor (usar solo para posicionar). */
  style?: ViewStyle;
}

const SIZES: Record<DimensionBadgeSize, { box: number; font: number }> = {
  sm: { box: 18, font: 10 },
  md: { box: 24, font: 13 },
  lg: { box: 32, font: 16 },
};

// TASK-066: estilos de layout a nivel de modulo. Los colores (dim.badge) y
// dimensiones (size prop) se aplican inline — dependen de props, no del tema.
const s = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export function DimensionBadge({
  dimension,
  size = "md",
  style,
}: DimensionBadgeProps) {
  const dim = getDimension(dimension);
  const dims = SIZES[size];

  return (
    <View
      style={[
        s.container,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
          backgroundColor: dim.badge,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Dimension ${dim.label}`}
    >
      <Text style={[s.text, { fontSize: dims.font, lineHeight: dims.font + 2 }]}>
        {dim.icon}
      </Text>
    </View>
  );
}
