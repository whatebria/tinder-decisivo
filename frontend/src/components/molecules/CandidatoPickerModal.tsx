/**
 * Modal para elegir un candidato de una lista. Usado por el comparador.
 * Client-side: no fetchea, recibe la lista via props.
 *
 * Filtros disponibles:
 *   - Busqueda de texto (nombre / partido)
 *   - Tipo de eleccion (chips horizontales, single-select)
 *
 * El filtro de eleccion es opcional: si `tiposEleccion` no se pasa o esta
 * vacio, la seccion no se renderiza.
 *
 * BUG-044: la lista de candidatos usa FlatList (virtualizada) en lugar de
 * View + map. El Modal pasa bodyScrollable={false} para evitar el error
 * de VirtualizedList anidada en ScrollView. La busqueda y los chips de
 * filtro viven en ListHeaderComponent.
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from "react-native";

import type { Candidato, TipoEleccion } from "../../api/endpoints";
import { Modal } from "./Modal";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { nombreCompleto } from "../../utils/candidato";

interface Props {
  visible: boolean;
  title?: string;
  candidatos: Candidato[];
  /** Tipos de eleccion disponibles para filtrar. Si esta vacio, no se muestra el filtro. */
  tiposEleccion?: TipoEleccion[];
  /** Candidato ya elegido en OTRO slot (se filtra para evitar A === B). */
  excluirId?: number | null;
  onSelect: (candidato: Candidato) => void;
  onClose: () => void;
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: radii.rSm,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp2,
    fontSize: 14,
    marginBottom: spacing.sp3,
  },
  filterLabel: {
    ...typography.overline,
    fontWeight: "700",
    marginBottom: spacing.sp2,
  },
  chipsRow: {
    gap: spacing.sp2,
    paddingBottom: spacing.sp3,
    alignItems: "center",
  },
  chip: {
    paddingVertical: spacing.sp1,
    paddingHorizontal: spacing.sp3,
    borderRadius: radii.rFull,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  emptyText: {
    padding: spacing.sp3,
    textAlign: "center",
  },
  item: {
    paddingVertical: spacing.sp3,
    paddingHorizontal: spacing.sp2,
    borderBottomWidth: 1,
  },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  // BUG-044: el FlatList necesita flex:1 para respetar el maxHeight del Modal.
  list: { flex: 1 },
});

export function CandidatoPickerModal({
  visible,
  title = "Elegir candidato",
  candidatos,
  tiposEleccion = [],
  excluirId,
  onSelect,
  onClose,
}: Props) {
  const c = useThemeColors();
  const [query, setQuery] = useState("");
  const [tipoSel, setTipoSel] = useState<number | null>(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidatos.filter((cand) => {
      if (cand.id == null) return false;
      if (excluirId != null && cand.id === excluirId) return false;
      if (
        tipoSel !== null &&
        !(cand.tipos_eleccion ?? []).includes(tipoSel)
      ) {
        return false;
      }
      if (!q) return true;
      const nombre = nombreCompleto(cand).toLowerCase();
      const partido = (cand.partido ?? "").toLowerCase();
      return nombre.includes(q) || partido.includes(q);
    });
  }, [candidatos, query, excluirId, tipoSel]);

  const handleSelect = useCallback((cand: Candidato) => {
    onSelect(cand);
    setQuery("");
    setTipoSel(null);
  }, [onSelect]);

  function chipColors(isActive: boolean) {
    return isActive
      ? { borderColor: c.primary, backgroundColor: c.primary }
      : { borderColor: c.border, backgroundColor: c.bg };
  }

  // BUG-044: header del FlatList = search + chips de tipo.
  // Memoizar para evitar que el FlatList remonte el header en cada keystroke.
  const ListHeader = useMemo(() => (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nombre o partido..."
        placeholderTextColor={c.textSecondary}
        style={[styles.search, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
        accessibilityLabel="Buscar candidato"
      />

      {tiposEleccion.length > 0 ? (
        <>
          <Text style={[styles.filterLabel, { color: c.textSecondary }]}>Tipo de eleccion</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <Pressable
              onPress={() => setTipoSel(null)}
              style={[styles.chip, chipColors(tipoSel === null)]}
              accessibilityRole="button"
              accessibilityLabel="Todas las elecciones"
            >
              <Text style={[styles.chipText, { color: tipoSel === null ? c.textOnPrimary : c.textSecondary }]}>
                Todas
              </Text>
            </Pressable>
            {tiposEleccion
              .filter((t) => t.id != null)
              .map((t) => {
                const isActive = tipoSel === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTipoSel(isActive ? null : t.id!)}
                    style={[styles.chip, chipColors(isActive)]}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar por ${t.nombre}`}
                  >
                    <Text style={[styles.chipText, { color: isActive ? c.textOnPrimary : c.textSecondary }]}>
                      {t.nombre}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
        </>
      ) : null}
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [query, tipoSel, tiposEleccion, c]);

  const renderItem = useCallback(({ item: cand }: ListRenderItemInfo<Candidato>) => (
    <Pressable
      onPress={() => handleSelect(cand)}
      accessibilityRole="button"
      accessibilityLabel={`Elegir ${nombreCompleto(cand)}`}
      style={({ pressed }) => [
        styles.item,
        { borderBottomColor: c.border },
        pressed && { backgroundColor: c.bg },
      ]}
    >
      <Text style={[styles.itemName, { color: c.text }]}>{nombreCompleto(cand)}</Text>
      {cand.partido ? (
        <Text style={[styles.itemMeta, { color: c.textSecondary }]}>{cand.partido}</Text>
      ) : null}
    </Pressable>
  ), [handleSelect, c]);

  const ListEmpty = useMemo(() => (
    <Text style={[styles.emptyText, { color: c.textSecondary }]}>
      No hay candidatos que coincidan.
    </Text>
  ), [c.textSecondary]);

  return (
    <Modal visible={visible} onClose={onClose} title={title} bodyScrollable={false}>
      <FlatList<Candidato>
        style={styles.list}
        data={filtrados}
        keyExtractor={(cand) => String(cand.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        // BUG-044: limitar renders iniciales para reducir el delay de apertura.
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={5}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />
    </Modal>
  );
}
