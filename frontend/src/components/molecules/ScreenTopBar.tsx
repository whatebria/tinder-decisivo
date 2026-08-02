/**
 * ScreenTopBar: back + título centrado (bold) + subtítulo + info.
 *
 * Pattern genérico del wireframe (Cuestionario, Resultados, Perfil, Comparador,
 * Mis Listas, Noticias, etc.). Layout: [<-]  Titulo   [i]
 *                                           Subtítulo
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

export interface ScreenTopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onInfo?: () => void;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp2,
    paddingVertical: spacing.sp2,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radii.rMd,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlaceholder: { width: 44, height: 44 },
  centerCol: { flex: 1, alignItems: "center", gap: 2 },
  title: { fontSize: 13, fontWeight: "600" },
  subtitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "600",
  },
});

export function ScreenTopBar({
  title,
  subtitle,
  onBack,
  onInfo,
}: ScreenTopBarProps) {
  const c = useThemeColors();

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          style={[styles.btn, { borderColor: c.border2 }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-left" size={18} color={c.text} />
        </Pressable>
      ) : (
        <View style={styles.btnPlaceholder} />
      )}

      <View style={styles.centerCol}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onInfo ? (
        <Pressable
          style={[styles.btn, { borderColor: c.border2 }]}
          onPress={onInfo}
          accessibilityRole="button"
          accessibilityLabel="Más información"
        >
          <Icon name="info" size={18} color={c.text} />
        </Pressable>
      ) : (
        <View style={styles.btnPlaceholder} />
      )}
    </View>
  );
}
