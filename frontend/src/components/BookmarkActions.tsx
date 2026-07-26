/**
 * BookmarkActions: par de botones toggle (favorito + descartar) reusables.
 *
 * Variantes:
 * - size="sm" -> chips chicos con emoji + label corto (para cards de ranking)
 * - size="lg" -> botones grandes con label completo (para detalle)
 *
 * Estado visual controlado por props (isFavorito, isDescartado).
 * La logica de mutation vive en el consumer via hooks (useToggleFavorito, etc).
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../theme/colors";

export interface BookmarkActionsProps {
  isFavorito: boolean;
  isDescartado: boolean;
  onToggleFavorito: () => void;
  onToggleDescartado: () => void;
  loading?: boolean;
  size?: "sm" | "lg";
  /** Si false, oculta el boton descartar (util cuando ya esta descartado y en pantalla dedicada) */
  showDescartar?: boolean;
}

export function BookmarkActions({
  isFavorito,
  isDescartado,
  onToggleFavorito,
  onToggleDescartado,
  loading = false,
  size = "sm",
  showDescartar = true,
}: BookmarkActionsProps) {
  const isLg = size === "lg";

  return (
    <View style={[styles.row, isLg && styles.rowLg]}>
      <ToggleButton
        active={isFavorito}
        onPress={onToggleFavorito}
        disabled={loading}
        activeColor={colors.primary}
        activeLabel={isLg ? "Es mi favorito" : "Favorito"}
        inactiveLabel={isLg ? "Marcar como favorito" : "Favorito"}
        icon={isFavorito ? "*" : "+"}
        accessibilityLabel={
          isFavorito ? "Quitar de favoritos" : "Marcar como favorito"
        }
        size={size}
      />

      {showDescartar ? (
        <ToggleButton
          active={isDescartado}
          onPress={onToggleDescartado}
          disabled={loading}
          activeColor={colors.danger}
          activeLabel={isLg ? "Descartado" : "Descartado"}
          inactiveLabel={isLg ? "Descartar candidato" : "Descartar"}
          icon="x"
          accessibilityLabel={
            isDescartado ? "Quitar de descartados" : "Descartar candidato"
          }
          size={size}
        />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Boton toggle interno
// ---------------------------------------------------------------------------
interface ToggleButtonProps {
  active: boolean;
  onPress: () => void;
  disabled: boolean;
  activeColor: string;
  activeLabel: string;
  inactiveLabel: string;
  icon: string;
  accessibilityLabel: string;
  size: "sm" | "lg";
}

function ToggleButton({
  active,
  onPress,
  disabled,
  activeColor,
  activeLabel,
  inactiveLabel,
  icon,
  accessibilityLabel,
  size,
}: ToggleButtonProps) {
  const isLg = size === "lg";
  const label = active ? activeLabel : inactiveLabel;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, disabled }}
      style={(state) => [
        styles.btn,
        isLg && styles.btnLg,
        active
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: colors.background, borderColor: colors.border },
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {disabled ? (
        <ActivityIndicator size="small" color={active ? "#FFFFFF" : activeColor} />
      ) : (
        <>
          <Text
            style={[
              styles.icon,
              isLg && styles.iconLg,
              { color: active ? "#FFFFFF" : activeColor },
            ]}
          >
            {icon}
          </Text>
          <Text
            style={[
              styles.text,
              isLg && styles.textLg,
              { color: active ? "#FFFFFF" : colors.text },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  rowLg: {
    gap: 12,
    flexWrap: "wrap",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
  },
  btnLg: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 48, // WCAG 2.2 AA touch target
    flex: 1,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 14,
    fontWeight: "800",
  },
  iconLg: {
    fontSize: 18,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
  textLg: {
    fontSize: 15,
    fontWeight: "700",
  },
});
