/**
 * CambiarDatoModal: modal generico para cambiar username o email.
 *
 * UX-074: campos de perfil editables desde la app con confirmacion de password.
 * Sigue el mismo patron que CambiarPasswordModal.
 *
 * El padre controla la validacion especifica del nuevo valor (ej: formato
 * de email, longitud de username). Este componente solo gestiona el layout
 * y el flujo de UX.
 */

import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { blurActiveElement } from "../../hooks/blurActiveElement";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";
import { FormField } from "./FormField";
import { Modal } from "./Modal";

export interface CambiarDatoModalProps {
  visible: boolean;
  title: string;
  /** Etiqueta para el campo del nuevo valor. Ej: "Nuevo nombre de usuario". */
  fieldLabel: string;
  /** Texto de ayuda bajo el campo del nuevo valor. */
  fieldHelper?: string;
  /** Error de validacion cliente para el nuevo valor (antes de submit). */
  fieldError?: string;
  /** Tipo de teclado para el campo del nuevo valor. */
  emailMode?: boolean;
  loading?: boolean;
  onCancel: () => void;
  /** Llamado con (newValue, currentPassword) cuando el usuario confirma. */
  onSubmit: (newValue: string, currentPassword: string) => void;
}

const styles = StyleSheet.create({
  message: { fontSize: 14, lineHeight: 20, marginBottom: spacing.sp3 },
  actions: { gap: spacing.sp2 },
});

export function CambiarDatoModal({
  visible,
  title,
  fieldLabel,
  fieldHelper,
  fieldError,
  emailMode = false,
  loading = false,
  onCancel,
  onSubmit,
}: CambiarDatoModalProps) {
  const c = useThemeColors();
  const [newValue, setNewValue] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = newValue.trim().length > 0 && password.length > 0 && !loading;

  function handleSubmit() {
    blurActiveElement();
    onSubmit(newValue.trim(), password);
  }

  function handleCancel() {
    blurActiveElement();
    setNewValue("");
    setPassword("");
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title={title}
      dismissOnBackdrop={!loading}
      maxWidth={440}
      footer={
        <View style={styles.actions}>
          <Button onPress={handleSubmit} loading={loading} disabled={!canSubmit}>
            {title}
          </Button>
          <Link block onPress={handleCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={[styles.message, { color: c.textSecondary }]}>
        Ingresa el nuevo valor y confirma con tu contraseña actual.
      </Text>

      <View>
        <FormField
          label={fieldLabel}
          helper={fieldHelper}
          value={newValue}
          onChangeText={setNewValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={emailMode ? "email-address" : "default"}
          autoComplete={emailMode ? "email" : "username"}
          textContentType={emailMode ? "emailAddress" : "username"}
          error={fieldError}
        />
        <FormField
          label="Contraseña actual"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
        />
      </View>
    </Modal>
  );
}
