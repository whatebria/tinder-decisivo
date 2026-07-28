/**
 * EliminarCuentaModal: doble confirmacion para borrado destructivo.
 *
 * Requiere ingresar password + escribir "ELIMINAR" (uppercase) para habilitar
 * el boton. Diseno pensado para prevenir clicks accidentales en accion no
 * recuperable.
 *
 * Refactor: usa <Modal> molecule base (tokens + dark mode reactivos).
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

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
  const c = useThemeColors();
  const isDark = useIsDark();
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        warning: {
          fontSize: 14,
          color: isDark ? c.danger100 : c.danger700,
          lineHeight: 20,
          backgroundColor: isDark ? c.danger800 : c.danger50,
          padding: spacing.sp3,
          borderRadius: radii.rSm,
          borderLeftWidth: 3,
          borderLeftColor: c.danger,
        },
        form: { gap: spacing.sp2, marginTop: spacing.sp1 },
        actions: { gap: spacing.sp2 },
      }),
    [c, isDark],
  );

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Eliminar mi cuenta"
      dismissOnBackdrop={!loading}
      maxWidth={440}
      footer={
        <View style={styles.actions}>
          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
            variant="danger"
          >
            Si, eliminar mi cuenta
          </Button>
          <Link block onPress={handleCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={styles.warning}>
        Esta accion es PERMANENTE. Se borran tus respuestas, tu ranking,
        tus favoritos, descartados y tu voto final. No hay vuelta atras.
      </Text>

      <View style={styles.form}>
        <FormField
          label="Tu contrasena"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
        />
        <FormField
          label={`Escribe ${PALABRA_MAGICA} para confirmar`}
          value={palabra}
          onChangeText={setPalabra}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>
    </Modal>
  );
}
