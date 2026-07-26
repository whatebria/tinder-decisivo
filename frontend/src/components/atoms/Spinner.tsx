/**
 * Spinner: ActivityIndicator con color del design system.
 */

import React from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "color"> {
  /** Color semantico. Default: primary. */
  variant?: "primary" | "secondary" | "onPrimary";
}

export function Spinner({ variant = "primary", size = "small", ...rest }: SpinnerProps) {
  const c = useThemeColors();
  const color =
    variant === "primary" ? c.primary : variant === "secondary" ? c.secondary : c.textOnPrimary;
  return <ActivityIndicator color={color} size={size} {...rest} />;
}
