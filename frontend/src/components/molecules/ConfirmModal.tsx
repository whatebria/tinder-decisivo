/**
 * ConfirmModal: modal generico de confirmacion para acciones destructivas.
 *
 * Uso:
 *   <ConfirmModal
 *     visible={open}
 *     title="Eliminar cuenta"
 *     message="Esto borra tu cuenta y todos tus datos."
 *     confirmLabel="Si, eliminar"
 *     variant="danger"
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *     loading={mutation.isPending}
 *   />
 *
 * Implementado con RN Modal + Pressable para consistencia con PreguntaInfoModal
 * (evita bugs de Tamagui en RN Web).
 */

import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Button
              onPress={onConfirm}
              loading={loading}
              variant={variant === "danger" ? "danger" : "primary"}
            >
              {confirmLabel}
            </Button>
            <Link block onPress={onCancel} disabled={loading}>
              {cancelLabel}
            </Link>
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
});
