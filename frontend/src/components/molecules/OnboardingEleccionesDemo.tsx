/**
 * OnboardingEleccionesDemo: demo decorativo/interactivo para el slide 2
 * del welcome tour ("Sigue las elecciones que te importan").
 *
 * Muestra 3 rows de eleccion con Toggle funcional (estado local),
 * visualmente identicas a GestionEleccionesScreen pero 100% estaticas.
 * Zero API calls.
 *
 * A11y: etiqueta visible "Ejemplo — no se guarda" y los toggles tienen
 * accessibilityLabel individuales. El contenedor tiene role="group".
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Toggle } from "../atoms/Toggle";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

interface DemoEleccion {
  id: string;
  nombre: string;
  scope: string;
  diasLabel: string;
}

const DEMO_ELECCIONES: readonly DemoEleccion[] = [
  { id: "presidencial", nombre: "Presidencial 2025", scope: "Nacional", diasLabel: "42 días" },
  { id: "alcaldes",     nombre: "Alcaldes 2024",     scope: "Comunal",  diasLabel: "120 días" },
  { id: "diputados",    nombre: "Diputados 2025",    scope: "Distrital",diasLabel: "42 días" },
];

/** Toggles ON por defecto para que la demo se vea activa al aterrizar. */
const INICIAL: Record<string, boolean> = {
  presidencial: true,
  alcaldes:     false,
  diputados:    true,
};

export function OnboardingEleccionesDemo() {
  const c = useThemeColors();
  const [activos, setActivos] = useState<Record<string, boolean>>(INICIAL);

  function toggle(id: string) {
    setActivos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.sp2, width: "100%", maxWidth: 360 },
        demoTag: {
          ...typography.overline,
          color: c.textSecondary,
          textAlign: "center",
          marginBottom: spacing.sp1,
        },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: c.card,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          paddingHorizontal: spacing.sp4,
          paddingVertical: spacing.sp3,
        },
        info: { flex: 1, gap: 2 },
        nombre: {
          ...typography.body,
          fontWeight: "600",
          color: c.text,
        },
        meta: {
          ...typography.small,
          color: c.textSecondary,
        },
      }),
    [c],
  );

  return (
    <View
      style={styles.container}
      accessibilityRole="group"
      accessibilityLabel="Ejemplo de lista de elecciones"
    >
      <Text style={styles.demoTag} accessibilityElementsHidden>
        EJEMPLO — interactivo, no se guarda
      </Text>

      {DEMO_ELECCIONES.map((el) => (
        <View key={el.id} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.nombre}>{el.nombre}</Text>
            <Text style={styles.meta}>{el.scope} · {el.diasLabel}</Text>
          </View>
          <Toggle
            value={activos[el.id] ?? false}
            onPress={() => toggle(el.id)}
            accessibilityLabel={`${activos[el.id] ? "Desactivar" : "Activar"} ${el.nombre}`}
          />
        </View>
      ))}
    </View>
  );
}
