/**
 * EliminarCuentaModal: doble confirmacion para borrado destructivo.
 *
 * Requiere ingresar password + escribir "ELIMINAR" (uppercase) para habilitar
 * el boton. Diseno pensado para prevenir clicks accidentales en accion no
 * recuperable.
 */

import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { FormInput } from "./FormInput";
import { PrimaryButton } from "./PrimaryButton";
import { TextButton } from "./TextButton";

const PALABRA_MAGICA = "ELIMINAR";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
  loading?: boolean;
}

export function EliminarCuentaModal({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}: Props) {
  const [password, setPassword] = useState("");
  const [palabra, setPalabra] = useState("");

  const canSubmit =
    password.length > 0 && palabra === PALABRA_MAGICA && !loading;

  function handleCancel() {
    setPassword("");
    setPalabra("");
    onCancel();
  }

  function handleSubmit() {
    onSubmit(password);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : handleCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Eliminar mi cuenta</Text>
          <Text style={styles.warning}>
            Esta accion es PERMANENTE. Se borran tus respuestas, tu ranking,
            tus favoritos, descartados y tu voto final. No hay vuelta atras.
          </Text>

          <View style={styles.form}>
            <FormInput
              placeholder="Tu contrasena"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Contrasena"
            />
            <Text style={styles.instruccion}>
              Para confirmar, escribe la palabra{" "}
              <Text style={styles.palabraMagica}>{PALABRA_MAGICA}</Text>:
            </Text>
            <FormInput
              placeholder={PALABRA_MAGICA}
              value={palabra}
              onChangeText={setPalabra}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Palabra de confirmacion"
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              onPress={handleSubmit}
              loading={loading}
              disabled={!canSubmit}
              variant="danger"
            >
              Si, eliminar mi cuenta
            </PrimaryButton>
            <TextButton onPress={handleCancel} disabled={loading}>
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
    maxWidth: 440,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#DC2626" },
  warning: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 20,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  form: { gap: 8, marginTop: 4 },
  instruccion: { fontSize: 13, color: "#374151", marginTop: 4 },
  palabraMagica: { fontWeight: "700", color: "#DC2626", letterSpacing: 1 },
  actions: { marginTop: 8, gap: 8 },
});
