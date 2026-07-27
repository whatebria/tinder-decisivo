/**
 * ShareModal: muestra un preview del texto a compartir + botones para copiar
 * o disparar el share nativo (Web Share API).
 *
 * El share nativo solo aparece si el browser lo soporta (mobile mayormente).
 * En desktop suele fallback a solo-copiar, que igual es util.
 *
 * Refactor: colores y sombras via tokens de theme (antes: hardcoded #FFFFFF,
 * #111827, etc — invisible en dark mode). onClose envuelto con
 * useBlurBeforeClose para no dejar foco en un descendiente cuando el modal
 * se oculta con aria-hidden.
 */

import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { canShareNative, copyToClipboard, shareNative } from "../../services/share";
import { useBlurBeforeClose } from "../../hooks/useBlurBeforeClose";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";

interface Props {
  visible: boolean;
  text: string;
  onClose: () => void;
}

export function ShareModal({ visible, text, onClose }: Props) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const hasNative = canShareNative();
  const handleClose = useBlurBeforeClose(onClose);

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleShare() {
    setSharing(true);
    const ok = await shareNative(text);
    setSharing(false);
    if (ok) handleClose();
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.sp4,
        },
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          width: "100%",
          maxWidth: 480,
          maxHeight: "85%",
          padding: spacing.sp4,
          gap: spacing.sp3,
          ...shadows.shLg,
        },
        title: { ...typography.h3, fontWeight: "700", color: c.text },
        subtitle: { ...typography.small, color: c.textSecondary },
        previewBox: {
          backgroundColor: c.gray100,
          borderRadius: radii.rSm,
          padding: spacing.sp3,
          maxHeight: 240,
          borderLeftWidth: 3,
          borderLeftColor: c.border,
        },
        previewText: {
          fontSize: 14,
          color: c.text,
          lineHeight: 20,
          fontFamily: "monospace",
        },
        actions: { marginTop: spacing.sp2, gap: spacing.sp2 },
      }),
    [c, shadows],
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Compartir mi ranking</Text>
          <Text style={styles.subtitle}>
            Este es el texto que se va a compartir:
          </Text>

          <ScrollView style={styles.previewBox}>
            <Text style={styles.previewText}>{text}</Text>
          </ScrollView>

          <View style={styles.actions}>
            {hasNative ? (
              <Button onPress={handleShare} loading={sharing}>
                Compartir
              </Button>
            ) : null}
            <Button onPress={handleCopy}>
              {copied ? "Copiado!" : "Copiar al portapapeles"}
            </Button>
            <Link block onPress={handleClose}>Cerrar</Link>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
