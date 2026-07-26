/**
 * Modal para elegir un candidato de una lista. Usado por el comparador.
 * Client-side: no fetchea, recibe la lista via props.
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

import type { Candidato } from "../../api/endpoints";
import { useThemeColors } from "../../theme/useTheme";

interface Props {
  visible: boolean;
  title?: string;
  candidatos: Candidato[];
  /** Candidato ya elegido en OTRO slot (se filtra para evitar A === B). */
  excluirId?: number | null;
  onSelect: (candidato: Candidato) => void;
  onClose: () => void;
}

export function CandidatoPickerModal({
  visible,
  title = "Elegir candidato",
  candidatos,
  excluirId,
  onSelect,
  onClose,
}: Props) {
  const c = useThemeColors();
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidatos.filter((cand) => {
      if (cand.id == null) return false;
      if (excluirId != null && cand.id === excluirId) return false;
      if (!q) return true;
      const nombre = `${cand.nombre} ${cand.apellido ?? ""}`.toLowerCase();
      const partido = (cand.partido ?? "").toLowerCase();
      return nombre.includes(q) || partido.includes(q);
    });
  }, [candidatos, query, excluirId]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: c.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre o partido..."
            placeholderTextColor={c.textSecondary}
            style={[
              styles.search,
              { backgroundColor: c.bg, borderColor: c.border, color: c.text },
            ]}
          />

          <ScrollView style={{ maxHeight: 360 }}>
            {filtrados.length === 0 ? (
              <Text style={{ color: c.textSecondary, padding: 12, textAlign: "center" }}>
                No hay candidatos que coincidan.
              </Text>
            ) : (
              filtrados.map((cand) => (
                <Pressable
                  key={cand.id}
                  onPress={() => {
                    onSelect(cand);
                    setQuery("");
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      backgroundColor: pressed ? c.bg : "transparent",
                      borderBottomColor: c.border,
                    },
                  ]}
                >
                  <Text style={[styles.itemName, { color: c.text }]}>
                    {cand.nombre} {cand.apellido ?? ""}
                  </Text>
                  {cand.partido ? (
                    <Text style={[styles.itemMeta, { color: c.textSecondary }]}>
                      {cand.partido}
                    </Text>
                  ) : null}
                </Pressable>
              ))
            )}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: c.textSecondary, fontWeight: "600" }}>Cerrar</Text>
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
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 17, fontWeight: "700" },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  closeBtn: { alignSelf: "center", paddingVertical: 8, paddingHorizontal: 16 },
});
