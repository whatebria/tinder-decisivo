/**
 * Modal: dialog base reusable. Header + body + footer opcionales.
 * Backdrop semitransparente (RN no soporta backdrop-filter blur nativo).
 * Animacion fade + scale desde 96% via `animationType="fade"` nativo.
 *
 * Los *Modal de dominio (Confirm, Share, Pregunta, ...) se refactorizan
 * en Fase 3 para consumir este.
 */

import React, { useMemo } from "react";
import {
  Modal as RNModal,
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
  /** Ancho maximo del card. Default: 480. */
  maxWidth?: number;
  /** Si el backdrop es tappable para cerrar. Default: true. */
  dismissOnBackdrop?: boolean;
  /** Estilo custom para el card. */
  cardStyle?: StyleProp<ViewStyle>;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  maxWidth = 480,
  dismissOnBackdrop = true,
  cardStyle,
}: ModalProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.sp4,
        },
        card: {
          width: "100%",
          maxWidth,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          ...shadows.shLg,
          overflow: "hidden",
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.sp5,
          paddingVertical: spacing.sp4,
          borderBottomWidth: 1,
          borderBottomColor: c.border2,
        },
        title: {
          fontSize: 18,
          fontWeight: "600",
          color: c.text,
          flexShrink: 1,
          marginRight: spacing.sp3,
        },
        body: { paddingHorizontal: spacing.sp5, paddingVertical: spacing.sp4 },
        footer: {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: spacing.sp2,
          paddingHorizontal: spacing.sp5,
          paddingVertical: spacing.sp4,
          borderTopWidth: 1,
          borderTopColor: c.border2,
        },
      }),
    [c, shadows, maxWidth],
  );

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onClose : undefined}
        accessibilityRole="none"
      >
        <Pressable onPress={() => {}} style={[styles.card, cardStyle]}>
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <IconButton
                onPress={onClose}
                accessibilityLabel="Cerrar"
                variant="ghost"
                size="sm"
              >
                <Icon name="close" color={c.textSecondary} size={18} />
              </IconButton>
            </View>
          ) : null}
          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: spacing.sp2 }}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
