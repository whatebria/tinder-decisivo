/**
 * HomeMatchLocked: card de "mejor match" en estado bloqueado.
 *
 * Se muestra cuando el user tiene al menos una eleccion activa pero NO ha
 * completado ningun cuestionario. El patron Tinder blur-to-reveal genera
 * motivacion: el user ve que HAY un candidato pero no puede verlo hasta
 * completar.
 *
 * Estructura:
 *   - Card con contenido difuminado (blur sobre una card generica)
 *   - Overlay oscuro sobre el blur con:
 *       icono candado
 *       headline "Completa para revelar"
 *       body dinamico (ej. "Faltan 5 preguntas en Presidencial")
 *       CTA "Continuar cuestionario" (accent)
 *
 * DS-11 Pantalla 1: El CTA en el hero y en el lock overlay usa --c-accent.
 * Overflow hidden sobre el container externo para el efecto blur correcto.
 *
 * WCAG: CTA con accessibilityRole="button" y label claro.
 * Sin emoji: todo iconico con SVG inline.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

export interface HomeMatchLockedProps {
  /** Texto debajo del headline. Ej: "Faltan 5 preguntas en Presidencial". */
  body: string;
  /** Callback al presionar el CTA. */
  onContinuar: () => void;
}

export function HomeMatchLocked({ body, onContinuar }: HomeMatchLockedProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: radii.rLg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: c.border2,
        },
        // Capa de contenido difuminado (placeholder generico)
        blurLayer: {
          backgroundColor: c.card,
          padding: spacing.sp4,
          gap: spacing.sp3,
        },
        blurRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
        },
        blurAvatar: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: c.border2,
        },
        blurLineWide: {
          height: 12,
          borderRadius: radii.rSm,
          backgroundColor: c.border2,
          flex: 1,
        },
        blurLineMedium: {
          height: 8,
          borderRadius: radii.rSm,
          backgroundColor: c.border2,
          width: "60%",
        },
        blurPct: {
          fontSize: 40,
          fontWeight: "900",
          color: c.border2,
          lineHeight: 44,
        },
        blurRadarPlaceholder: {
          height: 80,
          borderRadius: radii.rMd,
          backgroundColor: c.border2,
          opacity: 0.4,
        },
        // Overlay oscuro sobre el blur
        overlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // DS: fondo hero con opacidad alta para mantener identidad de marca
          backgroundColor: "rgba(28, 58, 82, 0.92)",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.sp5,
          gap: spacing.sp3,
        },
        lockIconWrapper: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.12)",
          alignItems: "center",
          justifyContent: "center",
        },
        headline: {
          fontSize: 15,
          fontWeight: "800",
          color: "#FFFFFF",
          textAlign: "center",
        },
        bodyText: {
          fontSize: 12,
          color: "rgba(255,255,255,0.60)",
          textAlign: "center",
          lineHeight: 17,
        },
        ctaWrapper: {
          width: "100%",
          marginTop: spacing.sp1,
        },
      }),
    [c],
  );

  return (
    <View style={styles.container}>
      {/* Contenido difuminado (canvas debajo del overlay) */}
      <View style={styles.blurLayer}>
        <View style={styles.blurRow}>
          <View style={styles.blurAvatar} />
          <View style={{ flex: 1, gap: spacing.sp2 }}>
            <View style={styles.blurLineWide} />
            <View style={styles.blurLineMedium} />
          </View>
          <Text style={styles.blurPct}>??%</Text>
        </View>
        <View style={styles.blurRadarPlaceholder} />
        <View style={styles.blurLineWide} />
      </View>

      {/* Overlay con mensaje de lock */}
      <View style={styles.overlay}>
        <View style={styles.lockIconWrapper}>
          <Icon name="lock" size={18} color="rgba(255,255,255,0.75)" />
        </View>

        <Text style={styles.headline}>Completa para revelar</Text>
        <Text style={styles.bodyText}>{body}</Text>

        <View style={styles.ctaWrapper}>
          <Button
            variant="accent"
            size="sm"
            onPress={onContinuar}
            accessibilityLabel="Continuar cuestionario para ver tu candidato"
          >
            Continuar cuestionario
          </Button>
        </View>
      </View>
    </View>
  );
}
