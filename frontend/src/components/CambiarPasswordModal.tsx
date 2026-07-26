/**
 * CambiarPasswordModal: modal con formulario para cambiar la password.
 *
 * Requiere current + new + confirm. Valida match en cliente antes de disparar
 * la mutation.
 */

import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { FormInput } from "./FormInput";
import { Button } from "./Button";
import { TextButton } from "./TextButton";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => void;
  loading?: boolean;
}

export function CambiarPasswordModal({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordsMatch = next.length > 0 && next === confirm;
  const canSubmit =
    current.length > 0 && next.length >= 8 && passwordsMatch && !loading;

  function handleSubmit() {
    onSubmit(current, next);
  }

  function handleCancel() {
    setCurrent("");
    setNext("");
    setConfirm("");
    onCancel();
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : handleCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Cambiar contrasena</Text>
          <Text style={styles.message}>
            Ingresa tu contrasena actual y luego la nueva (minimo 8 caracteres).
          </Text>

          <View style={styles.form}>
            <FormInput
              placeholder="Contrasena actual"
              value={current}
              onChangeText={setCurrent}
              secureTextEntry
              accessibilityLabel="Contrasena actual"
            />
            <FormInput
              placeholder="Nueva contrasena"
              value={next}
              onChangeText={setNext}
              secureTextEntry
              accessibilityLabel="Nueva contrasena"
            />
            <FormInput
              placeholder="Confirmar nueva contrasena"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              accessibilityLabel="Confirmar nueva contrasena"
            />
            {confirm.length > 0 && !passwordsMatch ? (
              <Text style={styles.error}>Las contrasenas no coinciden.</Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Button onPress={handleSubmit} loading={loading} disabled={!canSubmit}>
              Cambiar contrasena
            </Button>
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
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  message: { fontSize: 14, color: "#374151", lineHeight: 20 },
  form: { gap: 8, marginTop: 4 },
  error: { fontSize: 13, color: "#DC2626", fontWeight: "600" },
  actions: { marginTop: 8, gap: 8 },
});
