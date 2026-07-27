/**
 * Preview helpers para tokens del design system.
 *
 * Todos son componentes puros que reciben el token + su valor y renderizan
 * una demostracion visual + label + valor crudo.
 */

import React, { useMemo } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors } from "../../../theme/useTheme";

// ---------------------------------------------------------------------------
// ColorSwatch: recuadro con color + label + hex.
// ---------------------------------------------------------------------------
export interface ColorSwatchProps {
  name: string;
  value: string;
  /** Cuando true, muestra un check de contraste con blanco/negro (util para semanticos). */
  showContrast?: boolean;
}

export function ColorSwatch({ name, value, showContrast }: ColorSwatchProps) {
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: 120,
          gap: 4,
        },
        chip: {
          height: 56,
          borderRadius: radii.rSm,
          borderWidth: 1,
          borderColor: c.border,
        },
        name: { fontSize: 12, fontWeight: "600", color: c.text },
        hex: { fontSize: 11, fontFamily: "monospace", color: c.textSecondary },
        contrastRow: { flexDirection: "row", gap: 4, marginTop: 2 },
        contrastChip: {
          fontSize: 10,
          paddingHorizontal: 4,
          paddingVertical: 1,
          borderRadius: 3,
          fontWeight: "600",
          overflow: "hidden",
        },
      }),
    [c],
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.chip, { backgroundColor: value }]} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.hex}>{value.toUpperCase()}</Text>
      {showContrast ? (
        <View style={styles.contrastRow}>
          <Text style={[styles.contrastChip, { backgroundColor: value, color: "#FFFFFF" }]}>Aa</Text>
          <Text style={[styles.contrastChip, { backgroundColor: value, color: "#000000" }]}>Aa</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScaleBar: barra horizontal con ancho proporcional al valor (para spacing).
// ---------------------------------------------------------------------------
export interface ScaleBarProps {
  name: string;
  value: number;
  /** Valor maximo de la escala, para escalar visualmente. */
  maxValue: number;
}

export function ScaleBar({ name, value, maxValue }: ScaleBarProps) {
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: "row", alignItems: "center", gap: spacing.sp3, minHeight: 24 },
        name: { fontSize: 12, fontFamily: "monospace", color: c.text, width: 40 },
        bar: { height: 20, backgroundColor: c.primary, borderRadius: 2 },
        value: { fontSize: 12, fontFamily: "monospace", color: c.textSecondary, width: 50 },
      }),
    [c],
  );
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.bar, { width: `${pct}%` }]} />
      <Text style={styles.value}>{value}px</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// RadiusBox: cuadrado con el radius aplicado.
// ---------------------------------------------------------------------------
export interface RadiusBoxProps {
  name: string;
  value: number;
}

export function RadiusBox({ name, value }: RadiusBoxProps) {
  const c = useThemeColors();
  const displayVal = value >= 9999 ? "full" : `${value}px`;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: "center", gap: 4, width: 80 },
        box: {
          width: 60,
          height: 60,
          backgroundColor: c.accent2,
          borderWidth: 2,
          borderColor: c.primary,
          borderRadius: value,
        },
        name: { fontSize: 12, fontFamily: "monospace", color: c.text },
        value: { fontSize: 11, color: c.textSecondary },
      }),
    [c, value],
  );
  return (
    <View style={styles.wrap}>
      <View style={styles.box} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.value}>{displayVal}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ShadowCard: card con sombra aplicada.
// ---------------------------------------------------------------------------
export interface ShadowCardProps {
  name: string;
  style: ViewStyle;
  /** Descripcion corta del uso (ej. "cards, chips"). */
  usage?: string;
}

export function ShadowCard({ name, style, usage }: ShadowCardProps) {
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: "center", gap: 6, width: 140, padding: spacing.sp3 },
        card: {
          width: 100,
          height: 60,
          backgroundColor: c.card,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border,
        },
        name: { fontSize: 12, fontFamily: "monospace", color: c.text, fontWeight: "600" },
        usage: { fontSize: 11, color: c.textSecondary, textAlign: "center" },
      }),
    [c],
  );
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, style]} />
      <Text style={styles.name}>{name}</Text>
      {usage ? <Text style={styles.usage}>{usage}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// TypeSample: muestra de texto con un estilo tipografico.
// ---------------------------------------------------------------------------
export interface TypeSampleProps {
  name: string;
  style: TextStyle;
  sample?: string;
}

export function TypeSample({ name, style, sample }: TypeSampleProps) {
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          gap: 4,
          paddingVertical: spacing.sp2,
          borderBottomWidth: 1,
          borderBottomColor: c.border2,
        },
        meta: { fontSize: 11, fontFamily: "monospace", color: c.textSecondary },
        text: { color: c.text },
      }),
    [c],
  );
  const size = typeof style.fontSize === "number" ? style.fontSize : "?";
  const weight = style.fontWeight ?? "?";
  return (
    <View style={styles.row}>
      <Text style={styles.meta}>
        {name} — {size}px / {String(weight)}
      </Text>
      <Text style={[styles.text, style]}>{sample ?? "El zorro rapido salta sobre el perro perezoso"}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MotionSample: boton que al presionar dispara un fade con la duracion dada.
// ---------------------------------------------------------------------------
export interface MotionSampleProps {
  name: string;
  duration: number;
}

export function MotionSample({ name, duration }: MotionSampleProps) {
  const c = useThemeColors();
  const opacity = React.useRef(new Animated.Value(1)).current;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: "center", gap: 6, width: 120 },
        btn: {
          paddingVertical: spacing.sp2,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rSm,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
        },
        btnLabel: { fontSize: 12, color: c.text, fontWeight: "600" },
        box: {
          width: 80,
          height: 40,
          backgroundColor: c.primary,
          borderRadius: radii.rSm,
        },
        meta: { fontSize: 11, fontFamily: "monospace", color: c.textSecondary },
      }),
    [c],
  );

  function trigger() {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.15, duration, useNativeDriver: true, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
    ]).start();
  }

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.box, { opacity }]} />
      <Pressable style={styles.btn} onPress={trigger} accessibilityRole="button">
        <Text style={styles.btnLabel}>Play</Text>
      </Pressable>
      <Text style={styles.meta}>
        {name} — {duration}ms
      </Text>
    </View>
  );
}
