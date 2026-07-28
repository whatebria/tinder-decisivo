/**
 * CambiarPasswordModal: modal con formulario para cambiar la password.
 *
 * Requiere current + new + confirm. Valida match en cliente antes de disparar
 * la mutation.
 *
 * Refactor: usa <Modal> molecule base (tokens + dark mode reactivos).
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

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
  const c = useThemeColors();
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        message: {
          fontSize: 14,
          color: c.textSecondary,
          lineHeight: 20,
          marginBottom: spacing.sp3,
        },
        actions: { gap: spacing.sp2 },
      }),
    [c],
  );

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Cambiar contrasena"
      dismissOnBackdrop={!loading}
      maxWidth={440}
      footer={
        <View style={styles.actions}>
          <Button onPress={handleSubmit} loading={loading} disabled={!canSubmit}>
            Cambiar contrasena
          </Button>
          <Link block onPress={handleCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={styles.message}>
        Ingresa tu contrasena actual y luego la nueva (minimo 8 caracteres).
      </Text>

      <View>
        <FormField
          label="Contrasena actual"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
        />
        <FormField
          label="Nueva contrasena"
          helper="Minimo 8 caracteres."
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormField
          label="Confirmar nueva contrasena"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={
            confirm.length > 0 && !passwordsMatch
              ? "Las contrasenas no coinciden."
              : undefined
          }
        />
      </View>
    </Modal>
  );
}
