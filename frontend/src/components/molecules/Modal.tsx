/**
 * Modal: dialog base reusable. Header + body + footer opcionales.
 * Backdrop semitransparente (RN no soporta backdrop-filter blur nativo).
 * Animacion fade + scale desde 96% via `animationType="fade"` nativo.
 *
 * Consumido por todos los *Modal de dominio del proyecto: ConfirmModal,
 * ShareModal, PreguntaInfoModal, CambiarPasswordModal, EliminarCuentaModal,
 * EditarRespuestaModal, CandidatoPickerModal.
 */

import React from "react";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { useBlurBeforeClose } from "../../hooks/useBlurBeforeClose";
import { useModalDimensions } from "../../hooks/useModalDimensions";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  /** Titulo del header. Si se omite, no se renderiza header. */
  title?: string;
  /** Contenido del body. */
  children: React.ReactNode;
  /** Botones del footer (usar <Button/> u otro). */
  footer?: React.ReactNode;
  /**
   * Override del ancho maximo del card. Default: modalLayout.maxWidth (480).
   * Solo usar cuando la UX del modal necesita algo distinto (ej: picker
   * con grid ancho). Preferir el default para consistencia.
   */
  maxWidth?: number;
  /** Si el backdrop es tappable para cerrar. Default: true. */
  dismissOnBackdrop?: boolean;
  /** Estilo custom para el card. */
  cardStyle?: StyleProp<ViewStyle>;
  /**
   * BUG-044: cuando false, el body NO usa ScrollView sino un View plano.
   * Util para contenido que gestiona su propio scroll (FlatList, FlashList).
   * Default: true.
   */
  bodyScrollable?: boolean;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sp4,
  },
  // width/maxWidth/maxHeight applied inline (derived from hook at runtime)
  card: {
    width: "100%",
    borderRadius: radii.rLg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp5,
    paddingVertical: spacing.sp4,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: spacing.sp3,
  },
  body: {
    // flexShrink permite que el ScrollView respete el maxHeight del card:
    // header y footer ocupan su alto natural (fixed), el body toma el
    // resto y scrollea internamente cuando el contenido lo supera.
    flexShrink: 1,
    paddingHorizontal: spacing.sp5,
    paddingVertical: spacing.sp4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sp2,
    paddingHorizontal: spacing.sp5,
    paddingVertical: spacing.sp4,
    borderTopWidth: 1,
  },
});

export function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  dismissOnBackdrop = true,
  cardStyle,
  bodyScrollable = true,
}: ModalProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const dims = useModalDimensions();
  // Blur al elemento con foco antes de cerrar (evita warning aria-hidden en web).
  const handleClose = useBlurBeforeClose(onClose);
  const effectiveMaxWidth = maxWidth ?? dims.maxWidth;

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS empuja hacia arriba con padding, Android reajusta el alto.
        // Web es no-op (RNW no implementa el behavior nativo del teclado).
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? handleClose : undefined}
          accessibilityRole="none"
        >
          <Pressable
            onPress={() => {}}
            style={[
              styles.card,
              { maxWidth: effectiveMaxWidth, maxHeight: dims.maxHeight, backgroundColor: c.card, ...shadows.shLg },
              cardStyle,
            ]}
          >
            {title ? (
              <View style={[styles.header, { borderBottomColor: c.border2 }]}>
                <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                <IconButton
                  onPress={handleClose}
                  accessibilityLabel="Cerrar"
                  variant="ghost"
                  size="sm"
                >
                  <Icon name="close" color={c.textSecondary} size={18} />
                </IconButton>
              </View>
            ) : null}
            {bodyScrollable ? (
              <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: spacing.sp2 }}>
                {children}
              </ScrollView>
            ) : (
              <View style={styles.body}>{children}</View>
            )}
            {footer ? (
              <View style={[styles.footer, { borderTopColor: c.border2 }]}>{footer}</View>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
