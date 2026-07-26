/**
 * Chip: pill grande para filtros o tags. Pressable opcional. Reactivo al tema.
 */

import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { useThemeColors } from "../theme/useTheme";

export interface ChipProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ children, active, onPress, style, ...rest }: ChipProps) {
  const c = useThemeColors();

  const s = useMemo(
    () =>
      StyleSheet.create({
        base: {
          paddingVertical: spacing.sp2 - 2,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rFull,
          alignSelf: "flex-start",
        },
        active: { backgroundColor: c.primary },
        inactive: { backgroundColor: c.accent2 },
        pressed: { opacity: 0.75 },
        text: { fontSize: 14, fontWeight: "500" },
        textActive: { color: c.textOnPrimary },
        textInactive: { color: c.text },
      }),
    [c]
  );

  const containerStyle = active ? s.active : s.inactive;
  const textStyle = active ? s.textActive : s.textInactive;

  if (!onPress) {
    return (
      <View style={[s.base, containerStyle, style]}>
        <Text style={[s.text, textStyle]}>{children}</Text>
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
        containerStyle,
        state.pressed && s.pressed,
        style,
      ]}
    >
      <Text style={[s.text, textStyle]}>{children}</Text>
    </Pressable>
  );
}
