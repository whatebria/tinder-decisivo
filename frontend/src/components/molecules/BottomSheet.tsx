/**
 * BottomSheet: sheet modal que sube desde abajo con handle bar y esquinas
 * superiores redondeadas. Patron reutilizable para filtros expandidos,
 * pickers, y otras acciones contextuales.
 *
 * Basado en design-system-lowfi.html tpl-filtros (Template 22):
 *   - Handle bar centrada arriba (indicador visual de "arrastrar")
 *   - Header con titulo (izq) + slot trailing opcional (ej: chip contador)
 *     + boton cerrar (der)
 *   - Body scrolleable
 *   - Footer opcional (para CTAs sticky abajo)
 *
 * Implementacion: RNModal con slideAnimation + backdrop + safe area.
 * Nota: no usa lib externa (@gorhom/bottom-sheet) porque agrega ~150 KB al
 * bundle y solo necesitamos el layout basico, no gestos avanzados.
 */

import React from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { useBlurBeforeClose } from "../../hooks/useBlurBeforeClose";
import { useSheetDimensions } from "../../hooks/useModalDimensions";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Titulo mostrado en el header del sheet (opcional). */
  title?: string;
  /** Slot opcional a la derecha del titulo (ej: chip "N activos"). */
  titleTrailing?: React.ReactNode;
  /** Contenido scrolleable del sheet. */
  children: React.ReactNode;
  /** CTAs stickies al pie (ej: Limpiar + Aplicar). */
  footer?: React.ReactNode;
  /** Cierra al tocar el backdrop. Default: true. */
  dismissOnBackdrop?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  titleTrailing,
  children,
  footer,
  dismissOnBackdrop = true,
}: BottomSheetProps) {
  const c = useThemeColors();
  const { maxHeight } = useSheetDimensions();
  // Blur al elemento con foco antes de cerrar (evita warning aria-hidden en web).
  const handleClose = useBlurBeforeClose(onClose);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? handleClose : undefined}
        // NO ponemos accessibilityRole="button" aca: RN Web lo renderizaria
        // como <button>, y adentro del sheet hay otros <button> (IconButton
        // Cerrar, chips, etc) -> HTML no permite botones anidados. La
        // accesibilidad del cierre esta cubierta por RNModal.onRequestClose
        // (tecla Escape) + el IconButton "Cerrar" visible del header.
      >
        {/* Evita que el press-in del sheet cierre el backdrop. Sin role
            explicito por la misma razon que el backdrop. */}
        <Pressable
          onPress={() => {}}
          style={[
            styles.sheet,
            { backgroundColor: c.card, maxHeight },
          ]}
        >
          <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
            {/* Handle bar */}
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: c.border }]} />
            </View>

            {/* Header */}
            {title || titleTrailing ? (
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  {title ? (
                    <Text style={[styles.title, { color: c.text }]}>
                      {title}
                    </Text>
                  ) : null}
                  {titleTrailing}
                </View>
                <IconButton
                  onPress={handleClose}
                  accessibilityLabel="Cerrar"
                  size="sm"
                  variant="ghost"
                >
                  <Icon name="close" size={18} color={c.text} />
                </IconButton>
              </View>
            ) : null}

            {/* Body */}
            <ScrollView
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Footer sticky */}
            {footer ? (
              <View style={[styles.footer, { borderTopColor: c.border }]}>
                {footer}
              </View>
            ) : null}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radii.rLg,
    borderTopRightRadius: radii.rLg,
    overflow: "hidden",
  },
  safeArea: { flexShrink: 1 },
  handleWrap: {
    alignItems: "center",
    paddingTop: spacing.sp2,
    paddingBottom: spacing.sp1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp2,
    gap: spacing.sp2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
    flexShrink: 1,
  },
  title: {
    ...typography.h3,
    fontWeight: "700",
  },
  body: {
    paddingHorizontal: spacing.sp4,
    paddingBottom: spacing.sp4,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sp2,
    paddingHorizontal: spacing.sp4,
    paddingTop: spacing.sp3,
    paddingBottom: spacing.sp2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
