/**
 * ShareModal: muestra un preview del texto a compartir + botones para copiar
 * o disparar el share nativo (Web Share API).
 *
 * El share nativo solo aparece si el browser lo soporta (mobile mayormente).
 * En desktop suele fallback a solo-copiar, que igual es util.
 */

import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { canShareNative, copyToClipboard, shareNative } from "../../services/share";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";

interface Props {
  visible: boolean;
  text: string;
  onClose: () => void;
}

export function ShareModal({ visible, text, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const hasNative = canShareNative();

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
    if (ok) onClose();
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
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
            <Button
              onPress={handleCopy}
              variant={hasNative ? "primary" : "primary"}
            >
              {copied ? "Copiado!" : "Copiar al portapapeles"}
            </Button>
            <Link block onPress={onClose}>Cerrar</Link>
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
    maxWidth: 480,
    maxHeight: "85%",
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280" },
  previewBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    maxHeight: 240,
    borderLeftWidth: 3,
    borderLeftColor: "#9CA3AF",
  },
  previewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    fontFamily: "monospace",
  },
  actions: { marginTop: 8, gap: 8 },
});
