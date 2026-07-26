/**
 * @deprecated Usar `Button` de `./Button` en su lugar. Este componente se mantiene
 * solo por compatibilidad con imports antiguos. Sera removido en una version futura.
 *
 * PrimaryButton: boton solido con Pressable de RN puro. Reactivo al tema.
 */

import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { useThemeColors } from "../theme/useTheme";

type Variant = "primary" | "success" | "danger";

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
  const c = useThemeColors();
  const isDisabled = disabled || loading;

  const { bg, styles } = useMemo(() => {
    const VARIANT_BG: Record<Variant, string> = {
      primary: c.primary,
      success: c.success,
      danger: c.danger,
    };
    return {
      bg: VARIANT_BG[variant],
      styles: StyleSheet.create({
        base: {
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 8,
          minHeight: 48,
          alignItems: "center",
          justifyContent: "center",
        },
        fullWidth: { alignSelf: "stretch" },
        pressed: { opacity: 0.85 },
        disabled: { opacity: 0.5 },
        inner: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
        text: {
          color: c.textOnPrimary,
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
        },
      }),
    };
  }, [c, variant]);

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
          <ActivityIndicator color={c.textOnPrimary} style={{ marginRight: 8 }} />
        ) : null}
        <Text style={styles.text}>{children}</Text>
      </View>
    </Pressable>
  );
}
