/**
 * Chip: pill grande para filtros o tags. Pressable opcional. Reactivo al tema.
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface ChipProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

// TASK-066: valores estaticos a nivel de modulo.
const s = StyleSheet.create({
  base: {
    paddingVertical: spacing.sp2 - 2,
    paddingHorizontal: spacing.sp3,
    borderRadius: radii.rFull,
    alignSelf: "flex-start",
  },
  pressed: { opacity: 0.75 },
  text: { fontSize: 14, fontWeight: "500" },
});

export function Chip({ children, active, onPress, style, ...rest }: ChipProps) {
  const c = useThemeColors();

  // Colores dinamicos (tema) aplicados inline
  const bgColor = active ? c.primary : c.accent2;
  const textColor = active ? c.textOnPrimary : c.text;

  if (!onPress) {
    return (
      <View style={[s.base, { backgroundColor: bgColor }, style]}>
        <Text style={[s.text, { color: textColor }]}>{children}</Text>
      </View>
    );
  }

  return (
    <Pressable
      {...rest}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={(state) => [
        s.base,
        { backgroundColor: bgColor },
        state.pressed && s.pressed,
        style,
      ]}
    >
      <Text style={[s.text, { color: textColor }]}>{children}</Text>
    </Pressable>
  );
}
