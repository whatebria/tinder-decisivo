/**
 * FilterBottomSheet — scaffold reutilizable para sheets de filtros.
 *
 * Encapsula el patron comun a todas las pantallas con filtros:
 *   - Pill "N activos" en el header (aparece solo si filtrosActivosCount > 0)
 *   - Footer sticky con "Limpiar todo" (ghost) + "Aplicar (N)" (primary)
 *   - Body scrolleable via BottomSheet
 *
 * Cada pantalla pasa sus secciones de filtros como children sin necesidad
 * de reimplementar el scaffold. Si el diseno del sheet de filtros cambia,
 * solo hay que tocar este archivo.
 *
 * Uso:
 *   <FilterBottomSheet
 *     visible={open}
 *     onClose={() => setOpen(false)}
 *     filtrosActivosCount={3}
 *     resultadosCount={42}
 *     onLimpiar={limpiarTodo}
 *   >
 *     <CollapsibleFilterSection title="Fecha" ...>...</CollapsibleFilterSection>
 *   </FilterBottomSheet>
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../atoms/Button";
import { BottomSheet } from "../molecules/BottomSheet";
import { radii } from "../../theme/radii";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Numero de filtros activos. Muestra el pill cuando > 0. */
  filtrosActivosCount: number;
  /** Cantidad de resultados en vivo — aparece en el boton "Aplicar". */
  resultadosCount: number;
  /** Limpia todos los filtros activos. */
  onLimpiar: () => void;
  /** Secciones de filtros: CollapsibleFilterSection, Input, chips, etc. */
  children: React.ReactNode;
  /** Titulo del header. Default: "Filtros". */
  title?: string;
}

export function FilterBottomSheet({
  visible,
  onClose,
  filtrosActivosCount,
  resultadosCount,
  onLimpiar,
  children,
  title = "Filtros",
}: FilterBottomSheetProps) {
  const c = useThemeColors();

  const trailing =
    filtrosActivosCount > 0 ? (
      <View style={[styles.pill, { backgroundColor: c.primary }]}>
        <Text style={[styles.pillText, { color: c.textOnPrimary }]}>
          {filtrosActivosCount} activo{filtrosActivosCount === 1 ? "" : "s"}
        </Text>
      </View>
    ) : null;

  const footer = (
    <>
      <View style={styles.footerLimpiar}>
        <Button variant="ghost" onPress={onLimpiar}>
          Limpiar todo
        </Button>
      </View>
      <View style={styles.footerAplicar}>
        <Button variant="primary" onPress={onClose}>
          {`Aplicar (${resultadosCount})`}
        </Button>
      </View>
    </>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      titleTrailing={trailing}
      footer={footer}
    >
      {children}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.rFull,
  },
  pillText: {
    ...typography.overline,
    fontWeight: "700",
    textTransform: "none",
    letterSpacing: 0,
  },
  footerLimpiar: { flex: 1 },
  footerAplicar: { flex: 2 },
});
