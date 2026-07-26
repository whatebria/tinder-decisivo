/**
 * Tooltip: bubble contextual que aparece al mantener pulsado (RN no tiene hover).
 * Aparece por 2s y se auto-oculta. Para persistente, usar prop `visible` controlado.
 */

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface TooltipProps {
  /** Texto del tooltip. */
  tip: string;
  /** Elemento sobre el que se muestra el tooltip. */
  children: React.ReactNode;
  /** Posicion del bubble. Default: "top". */
  position?: "top" | "bottom";
  /** Modo controlado (opcional). Si no se pasa, el toque toggle el estado interno. */
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Tooltip({ tip, children, position = "top", visible, style }: TooltipProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [internalVisible, setInternalVisible] = useState(false);

  const isVisible = visible ?? internalVisible;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { position: "relative", alignItems: "center" },
        bubble: {
          position: "absolute",
          maxWidth: 240,
          backgroundColor: c.text,
          paddingHorizontal: spacing.sp3,
          paddingVertical: spacing.sp2,
          borderRadius: radii.rSm,
          ...shadows.shMd,
          zIndex: 1000,
        },
        top: { bottom: "100%", marginBottom: spacing.sp2 },
        bottom: { top: "100%", marginTop: spacing.sp2 },
        text: { color: c.card, fontSize: 12, lineHeight: 16 },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.wrap, style]}>
      {isVisible ? (
        <View style={[styles.bubble, position === "top" ? styles.top : styles.bottom]}>
          <Text style={styles.text}>{tip}</Text>
        </View>
      ) : null}
      <Pressable
        onLongPress={() => setInternalVisible(true)}
        onPressOut={() => setInternalVisible(false)}
        accessibilityHint={tip}
      >
        {children}
      </Pressable>
    </View>
  );
}
