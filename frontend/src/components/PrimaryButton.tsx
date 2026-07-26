/**
 * PrimaryButton: boton solido con Pressable de RN puro.
 *
 * Existe porque <Button> de Tamagui v2.5 tiene issues de rendering + eventos
 * en la target web. Este es 100% portable y tiene todo lo que necesitamos:
 * loading, disabled, accesibilidad.
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { colors } from "../theme/colors";

type Variant = "primary" | "success" | "danger";

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.primary,
  success: colors.success,
  danger: colors.danger,
};

export interface PrimaryButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  loading?: boolean;
  variant?: Variant;
  fullWidth?: boolean;
}

export function PrimaryButton({
  children,
  loading,
  variant = "primary",
  fullWidth = true,
  disabled,
  style,
  ...props
}: PrimaryButtonProps) {
  const bg = VARIANT_BG[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        { backgroundColor: bg },
        fullWidth && styles.fullWidth,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
        ) : null}
        <Text style={styles.text}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 48, // WCAG 2.2 target
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});