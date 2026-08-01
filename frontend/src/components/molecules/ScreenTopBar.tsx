/**
 * ScreenTopBar: back + título centrado (bold) + subtítulo + info.
 *
 * Pattern genérico del wireframe (Cuestionario, Resultados, Perfil, Comparador,
 * Mis Listas, Noticias, etc.). Layout: [<-]  Titulo   [i]
 *                                            Subtítulo
 */

import React, { useMemo } from "react";
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

export function ScreenTopBar({
  title,
  subtitle,
  onBack,
  onInfo,
}: ScreenTopBarProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          borderColor: c.border2,
          alignItems: "center",
          justifyContent: "center",
        },
        btnPlaceholder: { width: 44, height: 44 },
        centerCol: { flex: 1, alignItems: "center", gap: 2 },
        title: {
          fontSize: 13,
          fontWeight: "600",
          color: c.text,
        },
        subtitle: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.7,
          color: c.textSecondary,
          fontWeight: "600",
        },
      }),
    [c],
  );

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          style={styles.btn}
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
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onInfo ? (
        <Pressable
          style={styles.btn}
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
