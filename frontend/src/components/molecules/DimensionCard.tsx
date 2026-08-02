/**
 * DimensionCard: card completa para mostrar el impacto de una dimension
 * tematica sobre algo (ej: repercusiones de una pregunta del cuestionario).
 *
 * Composicion: borde izquierdo grueso del color de dimension + header con
 * DimensionBadge + label coloreado + body text libre.
 *
 * Ambos colores (border, label) se resuelven via useDimensionColors que
 * pickea la variante light/dark segun el theme, garantizando WCAG AA
 * sobre el fondo interno (c.gray100).
 *
 * Uso:
 *   <DimensionCard dimension="economico">
 *     Mayor gasto publico requiere subir impuestos o reasignar recursos.
 *   </DimensionCard>
 *
 * Consumidor actual: PreguntaInfoModal (seccion "Repercusiones").
 * Consumidores futuros: comparador de candidatos por eje, breakdown en
 * ResultadoHero, etc.
 */
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { DimensionBadge } from "../atoms/DimensionBadge";
import { getDimension, type DimensionKey } from "../../domain/dimensiones";
import { useDimensionColors } from "../../hooks/useDimensionColors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface DimensionCardProps {
  dimension: DimensionKey;
  /** Contenido de la card. String simple o nodos custom. */
  children: React.ReactNode;
  /** Override del label si se necesita algo distinto al default. */
  labelOverride?: string;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderRadius: radii.rSm,
    padding: spacing.sp3,
    marginBottom: spacing.sp2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sp1,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: spacing.sp2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export function DimensionCard({
  dimension,
  children,
  labelOverride,
  style,
}: DimensionCardProps) {
  const c = useThemeColors();
  const colors = useDimensionColors(dimension);
  const dim = getDimension(dimension);

  return (
    <View
      style={[styles.card, { backgroundColor: c.gray100, borderLeftColor: colors.border }, style]}
    >
      <View style={styles.header}>
        <DimensionBadge dimension={dimension} size="md" />
        <Text style={[styles.label, { color: colors.text }]}>
          {labelOverride ?? dim.label}
        </Text>
      </View>
      {typeof children === "string" ? (
        <Text style={[styles.body, { color: c.textSecondary }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
