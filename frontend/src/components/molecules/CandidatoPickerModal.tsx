/**
 * Modal para elegir un candidato de una lista. Usado por el comparador.
 * Client-side: no fetchea, recibe la lista via props.
 *
 * Refactor: usa <Modal> molecule base. El boton "Cerrar" del footer se
 * elimina porque el Modal base ya trae la X en el header (evita redundancia).
 */

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Candidato } from "../../api/endpoints";
import { Modal } from "./Modal";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { nombreCompleto } from "../../utils/candidato";

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
      const nombre = nombreCompleto(cand).toLowerCase();
      const partido = (cand.partido ?? "").toLowerCase();
      return nombre.includes(q) || partido.includes(q);
    });
  }, [candidatos, query, excluirId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        search: {
          borderWidth: 1,
          borderRadius: radii.rSm,
          paddingHorizontal: spacing.sp3,
          paddingVertical: spacing.sp2,
          fontSize: 14,
          backgroundColor: c.bg,
          borderColor: c.border,
          color: c.text,
          marginBottom: spacing.sp3,
        },
        emptyText: {
          color: c.textSecondary,
          padding: spacing.sp3,
          textAlign: "center",
        },
        item: {
          paddingVertical: spacing.sp3,
          paddingHorizontal: spacing.sp2,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        },
        itemPressed: {
          backgroundColor: c.bg,
        },
        itemName: {
          fontSize: 15,
          fontWeight: "600",
          color: c.text,
        },
        itemMeta: {
          fontSize: 12,
          marginTop: 2,
          color: c.textSecondary,
        },
      }),
    [c],
  );

  function handleSelect(cand: Candidato) {
    onSelect(cand);
    setQuery("");
  }

  return (
    <Modal visible={visible} onClose={onClose} title={title} maxWidth={480}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nombre o partido..."
        placeholderTextColor={c.textSecondary}
        style={styles.search}
        accessibilityLabel="Buscar candidato"
      />

      {filtrados.length === 0 ? (
        <Text style={styles.emptyText}>No hay candidatos que coincidan.</Text>
      ) : (
        <View>
          {filtrados.map((cand) => (
            <Pressable
              key={cand.id}
              onPress={() => handleSelect(cand)}
              accessibilityRole="button"
              accessibilityLabel={`Elegir ${nombreCompleto(cand)}`}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              <Text style={styles.itemName}>{nombreCompleto(cand)}</Text>
              {cand.partido ? (
                <Text style={styles.itemMeta}>{cand.partido}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </Modal>
  );
}
