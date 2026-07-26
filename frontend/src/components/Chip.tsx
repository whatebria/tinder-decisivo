/**
 * Chip: pill grande para filtros o tags. Pressable opcional.
 * Si se pasa onPress, funciona como boton filtro con estado active/inactive.
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type PressableProps,
} from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

export interface ChipProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ children, active, onPress, style, ...rest }: ChipProps) {
  const containerStyle = active ? styles.active : styles.inactive;
  const textStyle = active ? styles.textActive : styles.textInactive;

  if (!onPress) {
    return (
      <View style={[styles.base, containerStyle, style]}>
        <Text style={[styles.text, textStyle]}>{children}</Text>
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
        styles.base,
        containerStyle,
        state.pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sp2 - 2,
    paddingHorizontal: spacing.sp3,
    borderRadius: radii.rFull,
    alignSelf: "flex-start",
  },
  active: { backgroundColor: colors.primary },
  inactive: { backgroundColor: colors.accent2 },
  pressed: { opacity: 0.75 },
  text: { fontSize: 14, fontWeight: "500" },
  textActive: { color: "#FFFFFF" },
  textInactive: { color: colors.text },
});
