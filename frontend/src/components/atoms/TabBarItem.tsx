/**
 * TabBarItem: item individual del BottomNav / Sidebar.
 *
 * Compone Icon (24px) + label vertical (11px), con estado activo destacado
 * por color primary y background tenue (8% en bottom, 10% en side).
 *
 * Alineado a design-system.html seccion "ORGANISM: BottomNav / Sidebar":
 *   .app-nav-item { display: flex; flex-direction: column; align-items: center;
 *                   gap: 4px; padding: 8px 4px; font-size: 11px; fw-medium;
 *                   border-radius: var(--r); }
 *   .app-nav-item.active { color: primary; fw-semibold; }
 *   .app-nav.bottom .active { background: 8% primary; }
 *   .app-nav.side   .active { background: 10% primary; }
 */

import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useBlurringPress } from "../../hooks/useBlurringPress";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon, type IconName } from "./Icon";

export type TabBarItemVariant = "bottom" | "side";

export interface TabBarItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** "bottom" (default) usa bg 8% primary en active; "side" usa 10%. */
  variant?: TabBarItemVariant;
}

/**
 * Approx del CSS `color-mix(in srgb, primary N%, transparent)`.
 * Requiere que primary sea un hex #RRGGBB. Devuelve #RRGGBBAA.
 * - 8%  -> 0x14 (20/255 = 7.8%)
 * - 10% -> 0x1A (26/255 = 10.2%)
 */
function alphaTint(hexColor: string, pct: 8 | 10): string {
  const suffix = pct === 8 ? "14" : "1A";
  if (hexColor.startsWith("#") && hexColor.length === 7) {
    return `${hexColor}${suffix}`;
  }
  // Fallback: si no es hex #RRGGBB, devolvemos el color pelado (visualmente
  // habra menos contraste pero no rompe).
  return hexColor;
}

const styles = StyleSheet.create({
  wrapBottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp1,
    minHeight: 56,
    borderRadius: radii.rSm,
  },
  wrapSide: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sp3,
    paddingHorizontal: spacing.sp1,
    minHeight: 56,
    borderRadius: radii.rLg,
  },
  label: { fontSize: 11 },
});

export function TabBarItem({
  icon,
  label,
  active,
  onPress,
  accessibilityLabel,
  variant = "bottom",
}: TabBarItemProps) {
  const c = useThemeColors();
  const tint = active ? c.primary : c.textSecondary;
  const activeBg = active
    ? alphaTint(c.primary, variant === "side" ? 10 : 8)
    : "transparent";

  // El onPress de un tab tipicamente dispara `navigation.navigate(...)`, lo
  // cual hace que React Navigation aplique aria-hidden a la screen saliente.
  // Si el foco sigue en este Pressable cuando eso pasa, Chromium chilla con
  // WCAG 2.4.3. Blureamos ANTES de invocar el onPress del consumer.
  const handlePress = useBlurringPress(onPress);
  const wrapBase = variant === "side" ? styles.wrapSide : styles.wrapBottom;

  return (
    <Pressable
      style={({ pressed }) => [
        wrapBase,
        { backgroundColor: activeBg },
        pressed ? { opacity: 0.6 } : null,
      ]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Icon name={icon} size={24} color={tint} />
      <Text
        style={[
          styles.label,
          { fontWeight: active ? "600" : "500", color: tint },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
