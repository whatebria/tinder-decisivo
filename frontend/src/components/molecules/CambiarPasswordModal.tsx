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
import { blurActiveElement } from "../../hooks/blurActiveElement";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MSG } from "../../constants/validation";

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
    current.length > 0 && next.length >= PASSWORD_MIN_LENGTH && passwordsMatch && !loading;

  // Blur al elemento con foco ANTES de que el padre haga setState(false).
  // Ver hooks/blurActiveElement para contexto.
  function handleSubmit() {
    blurActiveElement();
    onSubmit(current, next);
  }

  function handleCancel() {
    blurActiveElement();
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
      title="Cambiar contraseña"
      dismissOnBackdrop={!loading}
      maxWidth={440}
      footer={
        <View style={styles.actions}>
          <Button onPress={handleSubmit} loading={loading} disabled={!canSubmit}>
            Cambiar contraseña
          </Button>
          <Link block onPress={handleCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={styles.message}>
        Ingresa tu contraseña actual y luego la nueva ({PASSWORD_MIN_LENGTH_MSG.toLowerCase()})
      </Text>

      <View>
        <FormField
          label="Contraseña actual"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
        />
        <FormField
          label="Nueva contraseña"
          helper={PASSWORD_MIN_LENGTH_MSG}
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={
            // UX-044: feedback de longitud insuficiente antes de intentar confirmar.
            next.length > 0 && next.length < PASSWORD_MIN_LENGTH
              ? PASSWORD_MIN_LENGTH_MSG
              : undefined
          }
        />
        <FormField
          label="Confirmar nueva contraseña"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={
            confirm.length > 0 && !passwordsMatch
              ? "Las contraseñas no coinciden."
              : undefined
          }
        />
      </View>
    </Modal>
  );
}
