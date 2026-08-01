/**
 * HomeTrustSection: cuadricula 2x2 de indicadores de confianza.
 *
 * Visible solo para usuarios sin ningun cuestionario completado (nuevo/guest).
 * Comunicar antes del primer contacto que la app es confiable reduce friction
 * y aumenta la tasa de inicio del cuestionario.
 *
 * Items fijos del DS (no editables desde props para evitar dilution):
 *   - Datos oficiales SERVEL 2025
 *   - Sin publicidad politica
 *   - Respuestas 100% privadas
 *   - Proyecto independiente
 *
 * DS-11 Pantalla 1: checkmarks usan --color-success (#6B9B7A).
 * Fondo: surface2 / border sutil para no competir con las secciones de accion.
 * Sin emojis. Solo texto e iconografia SVG inline via Icon atom.
 *
 * WCAG: el contenido es informativo, no interactivo — sin roles de boton.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

interface TrustItem {
  text: string;
}

const TRUST_ITEMS: readonly TrustItem[] = [
  { text: "Datos oficiales SERVEL 2025" },
  { text: "Sin publicidad politica" },
  { text: "Respuestas 100% privadas" },
  { text: "Proyecto independiente" },
] as const;

export function HomeTrustSection() {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: c.border2,
          borderWidth: 1.5,
          borderColor: c.border,
          borderRadius: radii.rLg,
          padding: spacing.sp4,
          gap: spacing.sp3,
        },
        label: {
          fontSize: 10,
          fontWeight: "800",
          color: c.primary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        },
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sp3,
        },
        item: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.sp2,
          width: "47%", // 2 columnas con gap
        },
        itemText: {
          fontSize: 11,
          fontWeight: "500",
          color: c.text,
          lineHeight: 15,
          flex: 1,
        },
      }),
    [c],
  );

  return (
    <View style={styles.container} accessibilityRole="none" importantForAccessibility="no">
      <Text style={styles.label}>Transparencia & confianza</Text>
      <View style={styles.grid}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.text} style={styles.item}>
            <Icon name="check" size={14} color={c.success} />
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
