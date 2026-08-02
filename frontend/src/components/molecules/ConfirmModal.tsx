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
 * Refactor: ahora consume el <Modal> molecule base (backdrop, animacion,
 * dark mode, tokens). Antes duplicaba backdrop/card/shadow con literales
 * hardcoded (no reactivo al tema, contrast issues en dark mode).
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal } from "./Modal";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";
import { blurActiveElement } from "../../hooks/blurActiveElement";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

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

const styles = StyleSheet.create({
  message: { fontSize: 15, lineHeight: 22 },
  actions: { gap: spacing.sp2 },
});

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
  const c = useThemeColors();

  // Blur al elemento con foco ANTES de que el padre haga setState(false).
  // Sin esto, el boton apretado retiene foco cuando RNW aplica aria-hidden
  // al Modal escondido -> warning WCAG 2.4.3. Ver hooks/blurActiveElement.
  function handleConfirm() {
    blurActiveElement();
    onConfirm();
  }
  function handleCancel() {
    blurActiveElement();
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
          <Button
            onPress={handleConfirm}
            loading={loading}
            variant={variant === "danger" ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
          <Link block onPress={handleCancel} disabled={loading}>
            {cancelLabel}
          </Link>
        </View>
      }
    >
      <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
    </Modal>
  );
}
