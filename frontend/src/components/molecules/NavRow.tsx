/**
 * NavRow: box tap-able con label + subtitulo opcional y chevron a la derecha.
 *
 * Es el patron visual dominante del wireframe `tpl-config` (design-system-lowfi.html):
 *   [icon?] [label + subtitle?]  ------>  [chevron-right]
 *
 * Se usa para navegar a sub-screens desde una lista de settings. Tambien util
 * para cualquier lista de "items navegables" (Ubicacion, Notificaciones,
 * Privacidad, etc.).
 *
 * Variantes:
 *   - default: color de texto normal, borde de tarjeta
 *   - danger:  color de texto/chevron danger, borde subtle (para acciones
 *              destructivas como "Reiniciar cuestionario" o "Borrar cuenta")
 *
 * Prop `iconLeading`:
 *   Icono a la izquierda del label para mejorar la escaneabilidad visual.
 *   UX-036: ConfiguracionScreen tenia todas las secciones con el mismo peso;
 *   agregar iconos permite al usuario identificar items sin leer el texto.
 *
 * NO renderiza avatar — para eso conviene un molecule especifico (ej. AccountRow).
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { useBlurringPress } from "../../hooks/useBlurringPress";
import { Icon, type IconName } from "../atoms/Icon";

export type NavRowVariant = "default" | "danger";

export interface NavRowProps
  extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /** Texto secundario debajo del label. Ej: "12 base · 4 extras · editable". */
  subtitle?: string;
  variant?: NavRowVariant;
  /** Sobrescribe el label como accessibilityLabel si necesitas mas contexto. */
  accessibilityLabel?: string;
  /** Icono opcional a la izquierda del label. UX-036: mejora escaneabilidad visual. */
  iconLeading?: IconName;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sp3,
    borderRadius: radii.rMd,
    borderWidth: 1,
    gap: spacing.sp3,
  },
  textCol: { flex: 1, gap: spacing.sp1 },
  label: { ...typography.body, fontWeight: "600" },
  subtitle: { ...typography.overline, textTransform: "none", letterSpacing: 0 },
});

export function NavRow({
  label,
  subtitle,
  variant = "default",
  accessibilityLabel,
  iconLeading,
  onPress,
  ...pressable
}: NavRowProps) {
  const c = useThemeColors();
  // Blur antes de navegar -> evita warning aria-hidden WCAG 2.4.3 en web.
  const handlePress = useBlurringPress(onPress);
  const isDanger = variant === "danger";
  const labelColor = isDanger ? c.danger : c.text;
  const accentColor = isDanger ? c.danger : c.primary;
  const chevronColor = isDanger ? c.danger : c.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.row,
        { borderColor: c.border, backgroundColor: c.card, opacity: pressed ? 0.7 : 1 },
      ]}
      {...pressable}
      onPress={handlePress}
    >
      {iconLeading ? (
        <Icon name={iconLeading} size={20} color={accentColor} />
      ) : null}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={20} color={chevronColor} />
    </Pressable>
  );
}
