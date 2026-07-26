/**
 * EditarRespuestaModal: modal para cambiar opcion + peso de una respuesta.
 *
 * Muestra:
 * - Enunciado de la pregunta (contexto)
 * - Selector de opciones Likert (5 chips)
 * - Selector de peso (4 chips: No importa / Poco / Importante / Muy importante)
 * - Aviso amarillo: "al guardar se recalcula tu match"
 * - Botones Guardar / Cancelar
 */

import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { MiRespuesta } from "../api/endpoints";
import { PrimaryButton } from "./PrimaryButton";
import { SelectableButton } from "./SelectableButton";
import { TextButton } from "./TextButton";

const PESOS: Array<{ value: number; label: string }> = [
  { value: 0, label: "No me importa" },
  { value: 1, label: "Poco importante" },
  { value: 2, label: "Importante" },
  { value: 3, label: "Muy importante" },
];

interface Props {
  visible: boolean;
  respuesta: MiRespuesta | null;
  onCancel: () => void;
  onSubmit: (opcionId: number, peso: number) => void;
  loading?: boolean;
}

export function EditarRespuestaModal({
  visible,
  respuesta,
  onCancel,
  onSubmit,
  loading = false,
}: Props) {
  const [opcionId, setOpcionId] = useState<number | null>(null);
  const [peso, setPeso] = useState<number>(1);

  // Reset al abrir con nueva respuesta.
  useEffect(() => {
    if (respuesta) {
      setOpcionId(respuesta.opcion_elegida);
      setPeso(respuesta.peso);
    }
  }, [respuesta]);

  if (!respuesta) return null;

  const changed =
    opcionId !== respuesta.opcion_elegida || peso !== respuesta.peso;

  function handleSubmit() {
    if (opcionId != null) onSubmit(opcionId, peso);
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={loading ? undefined : onCancel}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.eje}>{respuesta.eje_tematico_display}</Text>
            <Text style={styles.pregunta}>{respuesta.pregunta_texto}</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <Text style={styles.sectionTitle}>Tu respuesta</Text>
            <View style={styles.chipsColumn}>
              {respuesta.opciones
                .slice()
                .sort((a, b) => b.valor - a.valor)
                .map((op) => (
                  <SelectableButton
                    key={op.id}
                    selected={opcionId === op.id}
                    onPress={() => setOpcionId(op.id)}
                    accessibilityLabel={`Opcion ${op.texto}`}
                  >
                    {op.texto}
                  </SelectableButton>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Que tan importante es para ti</Text>
            <View style={styles.chipsColumn}>
              {PESOS.map((p) => (
                <SelectableButton
                  key={p.value}
                  selected={peso === p.value}
                  onPress={() => setPeso(p.value)}
                  accessibilityLabel={`Peso ${p.label}`}
                >
                  {p.label}
                </SelectableButton>
              ))}
            </View>

            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Al guardar, tu ranking de candidatos se va a recalcular con esta
                nueva respuesta.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <PrimaryButton
              onPress={handleSubmit}
              loading={loading}
              disabled={!changed || opcionId == null}
            >
              Guardar cambios
            </PrimaryButton>
            <TextButton onPress={onCancel} disabled={loading}>
              Cancelar
            </TextButton>
          </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  eje: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pregunta: { fontSize: 16, color: "#111827", fontWeight: "600", lineHeight: 22 },
  scroll: { flexGrow: 0 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsColumn: { gap: 8 },
  warning: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  warningText: { fontSize: 13, color: "#78350F", lineHeight: 18 },
  actions: { marginTop: 12, gap: 8 },
});
