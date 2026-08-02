/**
 * Tooltip: bubble contextual que aparece al mantener pulsado (RN no tiene hover).
 * Aparece por 2s y se auto-oculta. Para persistente, usar prop `visible` controlado.
 */

import React, { useState } from "react";
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

const styles = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center" },
  bubble: {
    position: "absolute",
    maxWidth: 240,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp2,
    borderRadius: radii.rSm,
    zIndex: 1000,
  },
  top: { bottom: "100%", marginBottom: spacing.sp2 },
  bottom: { top: "100%", marginTop: spacing.sp2 },
  text: { fontSize: 12, lineHeight: 16 },
});

export function Tooltip({ tip, children, position = "top", visible, style }: TooltipProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = visible ?? internalVisible;

  return (
    <View style={[styles.wrap, style]}>
      {isVisible ? (
        <View
          style={[
            styles.bubble,
            { backgroundColor: c.text, ...shadows.shMd },
            position === "top" ? styles.top : styles.bottom,
          ]}
        >
          <Text style={[styles.text, { color: c.card }]}>{tip}</Text>
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
