/**
 * RadioGroup: grupo de opciones de seleccion unica. Options grandes y
 * espaciadas, con hover suave y borde primary en la seleccionada.
 *
 * Ideal para el cuestionario ("Muy de acuerdo" ... "Muy en desacuerdo").
 * Reemplaza al uso repetido de _legacy/SelectableButton.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface RadioOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number = string> {
  options: ReadonlyArray<RadioOption<T>>;
  value: T | null;
  onChange: (v: T) => void;
  /** Label accesible del grupo entero. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function RadioGroup<T extends string | number = string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: RadioGroupProps<T>) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: spacing.sp2 },
        opt: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.sp4,
          paddingVertical: spacing.sp3,
          minHeight: 52,
          borderRadius: radii.rMd,
          borderWidth: 1.5,
          backgroundColor: c.card,
        },
        optDefault: { borderColor: c.border },
        optSelected: { borderColor: c.primary, backgroundColor: c.accent2 },
        dot: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.sp3,
        },
        dotDefault: { borderColor: c.textTertiary },
        dotSelected: { borderColor: c.primary },
        inner: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: c.primary,
        },
        label: { fontSize: 16, color: c.text, flexShrink: 1 },
        disabled: { opacity: 0.5 },
      }),
    [c],
  );

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
              selected ? styles.optSelected : styles.optDefault,
              opt.disabled && styles.disabled,
            ]}
          >
            <View style={[styles.dot, selected ? styles.dotSelected : styles.dotDefault]}>
              {selected ? <View style={styles.inner} /> : null}
            </View>
            <Text style={styles.label}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
