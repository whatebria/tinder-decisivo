/**
 * ListPickerModal: modal generico para elegir 1 item de una lista.
 * Reutilizable para: comuna, region, tipo eleccion, partido, etc.
 *
 * Diseno intencionalmente simple:
 * - Muestra items con title + subtitle opcional.
 * - Opcion `searchable` habilita input de busqueda con filtro por title/subtitle.
 * - Estado seleccionado se marca visualmente.
 * - Backdrop cierra el modal.
 *
 * Si en el futuro necesitas paginacion o multi-select, considerar armar
 * variantes en vez de crecer este componente.
 */

import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { useBlurBeforeClose } from "../../hooks/useBlurBeforeClose";
import { Spinner } from "../atoms/Spinner";

export interface ListPickerItem {
  id: number;
  title: string;
  subtitle?: string;
}

interface ListPickerModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  items: ListPickerItem[];
  selectedId: number | null;
  searchable?: boolean;
  loading?: boolean;
  emptyText?: string;
  onSelect: (item: ListPickerItem) => void;
  onClose: () => void;
}

export function ListPickerModal({
  visible,
  title,
  subtitle,
  items,
  selectedId,
  searchable = false,
  loading = false,
  emptyText = "No hay opciones disponibles.",
  onSelect,
  onClose,
}: ListPickerModalProps) {
  const c = useThemeColors();
  const [query, setQuery] = useState("");

  const handleClose = useBlurBeforeClose(() => {
    setQuery("");
    onClose();
  });

  const filtered = useMemo(() => {
    if (!searchable) return items;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.title} ${it.subtitle ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, searchable]);

  function selectAndReset(item: ListPickerItem) {
    // Blur al item apretado antes de que el modal se oculte con aria-hidden.
    if (typeof document !== "undefined") {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body && typeof active.blur === "function") {
        active.blur();
      }
    }
    setQuery("");
    onSelect(item);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.card, { backgroundColor: c.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}

          {searchable ? (
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar..."
              placeholderTextColor={c.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              style={[
                styles.search,
                {
              backgroundColor: c.bg,
                  borderColor: c.border,
                  color: c.text,
                },
              ]}
            />
          ) : null}

          <ScrollView style={{ maxHeight: 400 }}>
            {loading ? (
              <View style={styles.loadingBox}>
                <Spinner />
              </View>
            ) : filtered.length === 0 ? (
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {query ? "Sin resultados para tu busqueda." : emptyText}
              </Text>
            ) : (
              filtered.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => selectAndReset(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.item,
                      {
                        backgroundColor: isSelected
                          ? c.primary + "22"
                          : pressed
                            ? c.bg
                            : "transparent",
                        borderBottomColor: c.border,
                      },
                    ]}
                  >
                    <Text style={[styles.itemTitle, { color: c.text }]}>
                      {item.title}
                    </Text>
                    {item.subtitle ? (
                      <Text
                        style={[
                          styles.itemSubtitle,
                          { color: c.textSecondary },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            style={styles.closeBtn}
          >
            <Text style={[styles.closeText, { color: c.textSecondary }]}>
              Cerrar
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sp3,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radii.rLg,
    padding: spacing.sp4,
    gap: spacing.sp3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { ...typography.h3, fontWeight: "700" },
  subtitle: typography.small,
  search: {
    borderWidth: 1,
    borderRadius: radii.rSm,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp2,
    ...typography.body,
  },
  loadingBox: { padding: spacing.sp4, alignItems: "center" },
  emptyText: { padding: spacing.sp3, textAlign: "center", ...typography.body },
  item: {
    paddingVertical: spacing.sp3,
    paddingHorizontal: spacing.sp2,
    borderBottomWidth: 1,
  },
  itemTitle: { ...typography.body, fontWeight: "600" },
  itemSubtitle: { ...typography.small, marginTop: 2 },
  closeBtn: {
    alignSelf: "center",
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp4,
  },
  closeText: { ...typography.body, fontWeight: "600" },
});
