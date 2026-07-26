/**
 * CodeBlock: muestra un snippet con syntax basico (colores planos) y boton copiar.
 *
 * En web copia al clipboard con `navigator.clipboard`. En native devuelve un
 * feedback visual pero no copia (el visualizador esta pensado para uso web).
 */

import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors, useIsDark } from "../../../theme/useTheme";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const [copied, setCopied] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          backgroundColor: isDark ? "#0F1B21" : "#1E2A32",
          borderRadius: radii.rMd,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: c.border,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: spacing.sp2,
          paddingHorizontal: spacing.sp3,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        },
        lang: {
          color: "#8A9199",
          fontSize: 11,
          fontFamily: Platform.OS === "web" ? "monospace" : undefined,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        copyBtn: {
          paddingVertical: 4,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rSm,
          backgroundColor: copied ? "#4A7C5C" : "rgba(255,255,255,0.08)",
        },
        copyBtnText: {
          color: "#FFF",
          fontSize: 11,
          fontWeight: "600",
        },
        codeScroll: {
          paddingVertical: spacing.sp3,
          paddingHorizontal: spacing.sp4,
        },
        code: {
          color: "#E4E9EC",
          fontSize: 13,
          fontFamily: Platform.OS === "web" ? "'SF Mono', Menlo, Consolas, monospace" : undefined,
          lineHeight: 20,
        },
      }),
    [c, isDark, copied],
  );

  const handleCopy = async () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // silencioso: si el browser bloquea clipboard no hay mucho que hacer
      }
    } else {
      // Native: feedback visual pero no copia (feature web-first)
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.lang}>{language}</Text>
        <Pressable
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={copied ? "Copiado al portapapeles" : "Copiar codigo"}
          style={styles.copyBtn}
        >
          <Text style={styles.copyBtnText}>{copied ? "\u2713 Copiado" : "Copiar"}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeScroll}>
        <Text style={styles.code} selectable>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}
