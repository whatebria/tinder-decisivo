/**
 * OnboardingEleccionesDemo: demo del slide 2 del welcome tour.
 *
 * Componente presentacional puro -- sin estado interno, sin API calls.
 * El padre (OnboardingScreen) provee los datos reales del backend y el
 * handler de toggle conectado a `useElectionsPrefsStore`.
 *
 * Muestra maximo 2 elecciones para garantizar que el slide quepa en
 * pantalla sin scroll vertical (constraint UX-011).
 *
 * Co-localizado en screens/Onboarding/ (TASK-062): solo se usa en OnboardingScreen.
 *
 * A11y: los toggles tienen accessibilityLabel individuales.
 * El contenedor tiene role="none" para no fragmentar la a11y del slide.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Toggle } from "../../components/atoms/Toggle";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface OnboardingEleccionesDemoTipo {
  id: number;
  nombre: string;
}

export interface OnboardingEleccionesDemoProps {
  /** Lista de tipos de eleccion del backend. Se muestran maximo 2. */
  tipos: OnboardingEleccionesDemoTipo[];
  /**
   * IDs actualmente activos. `null` = no configurado aun
   * (todos activos por defecto -- refleja el estado inicial del store).
   */
  activeIds: number[] | null;
  /** Llama con el id del tipo que el usuario quiso cambiar. */
  onToggle: (id: number) => void;
}

/** Max items visibles (constraint UX-011 -- DEBUG: 3 para mostrar las elecciones 2025). */
const MAX_VISIBLE = 3;

export function OnboardingEleccionesDemo({
  tipos,
  activeIds,
  onToggle,
}: OnboardingEleccionesDemoProps) {
  const c = useThemeColors();

  // null = todos activos (primera visita). Resolvemos el Set de activos una sola vez.
  const activeSet: Set<number> | null = useMemo(
    () => (activeIds !== null ? new Set(activeIds) : null),
    [activeIds],
  );

  function isActive(id: number): boolean {
    // null = todos activos
    return activeSet === null ? true : activeSet.has(id);
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.sp2, width: "100%", maxWidth: 360 },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: c.card,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          paddingHorizontal: spacing.sp4,
          paddingVertical: spacing.sp2,
        },
        info: { flex: 1, gap: 2 },
        nombre: {
          ...typography.body,
          fontWeight: "600",
          color: c.text,
        },
      }),
    [c],
  );

  const visible = tipos.slice(0, MAX_VISIBLE);

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel="Elecciones disponibles"
    >
      {visible.map((tipo) => {
        const activo = isActive(tipo.id);
        return (
          <View key={tipo.id} style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.nombre}>{tipo.nombre}</Text>
            </View>
            <Toggle
              value={activo}
              onPress={() => onToggle(tipo.id)}
              accessibilityLabel={`${activo ? "Desactivar" : "Activar"} ${tipo.nombre}`}
            />
          </View>
        );
      })}
    </View>
  );
}
