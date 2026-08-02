/**
 * RadioGroup: grupo de opciones Likert con accesibilidad ARIA.
 * Genérico sobre <T> — el valor de cada opcion puede ser number, string, etc.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface RadioOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T> {
  options: ReadonlyArray<RadioOption<T>>;
  value: T | null;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sp2 },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp3,
    minHeight: 52,
    borderRadius: radii.rMd,
    borderWidth: 1.5,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sp3,
  },
  inner: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 16, flexShrink: 1 },
  disabled: { opacity: 0.5 },
});

export function RadioGroup<T>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: RadioGroupProps<T>) {
  const c = useThemeColors();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrap, style]}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            disabled={opt.disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !!opt.disabled }}
            style={[
              styles.opt,
              {
                borderColor: selected ? c.primary : c.border,
                backgroundColor: selected ? c.accent2 : c.card,
              },
              opt.disabled && styles.disabled,
            ]}
          >
            <View style={[styles.dot, { borderColor: selected ? c.primary : c.textTertiary }]}>
              {selected ? (
                <View style={[styles.inner, { backgroundColor: c.primary }]} />
              ) : null}
            </View>
            <Text style={[styles.label, { color: c.text }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
