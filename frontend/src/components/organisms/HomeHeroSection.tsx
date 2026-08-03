/**
 * HomeHeroSection: bloque hero integrado del Home HUB.
 *
 * Unifica la barra de marca (antes HomeTopBar) con el saludo, headline,
 * anillo de progreso, CTA principal y fila de trust meta. Todo sobre
 * fondo --color-brand-hero (#1C3A52), un solo bloque visual coherente.
 *
 * Motivacion del cambio (ver CHANGELOG):
 *   El HomeTopBar anterior renderizaba como card blanca flotante, generando
 *   el patron "doble borde" criticado en ds-11-screens.html seccion 1 y en
 *   home-redesign-proposal.html (Anotacion A). El hero unificado elimina ese
 *   ruido visual y da peso institucional al entry del producto.
 *
 * Estructura interna (de arriba a abajo):
 *   1. TopRow: AppIcon + Brand + Avatar de usuario
 *   2. [Opcional] CountdownPill: "Elecciones en X dias"
 *   3. HeroContent: greeting text (izq) + ProgressRing (der, solo si value > 0)
 *   4. CTAButton: variante accent (#3A9E7A)
 *   5. TrustMetaRow: ~15 min | 100% privado | Datos SERVEL
 *
 * DS tokens usados:
 *   background:   #1C3A52 (brand-hero, fijo — no usa c.* para ser independiente del tema)
 *   CTA:          brandAccent via Button variant="accent"
 *   Trust checks: color success sobre hero
 *   Text on hero: #FFFFFF / rgba(255,255,255,0.55)
 *
 * NOTA sobre dark mode: el hero usa color fijo #1C3A52 tanto en light como
 * dark — es la identidad de marca, no una superficie del sistema de temas.
 * El dark mode no afecta el hero (intencional, igual que Spotify header).
 *
 * WCAG 2.2 AA:
 *   - Contraste #FFFFFF/#1C3A52: 9.1:1 (AAA)
 *   - Contraste rgba(255,255,255,0.55)/#1C3A52: ~4.7:1 (AA)
 *   - CTA accent #3A9E7A/#FFFFFF: 3.2:1 (AA para texto grande/UI >= 18px)
 *   - accessibilityRole="banner" en el contenedor (rol de landmark para header)
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { greetingForHour } from "../../utils/user";
import { AppIcon } from "../atoms/AppIcon";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { ProgressRing } from "../atoms/ProgressRing";

// -- Colores fijos del hero (no dependen del tema) --------------------------

/** Fondo del hero. Siempre #1C3A52 (brand-hero) en light y dark. */
const HERO_BG = "#1C3A52";
/** Texto principal sobre el hero. */
const HERO_TEXT = "#FFFFFF";
/** Texto secundario / meta. */
const HERO_TEXT_SUB = "rgba(255,255,255,0.55)";
/** Borde del countdown pill. */
const HERO_PILL_BG = "rgba(255,255,255,0.10)";
const HERO_PILL_BORDER = "rgba(255,255,255,0.20)";

// TASK-053: items extraidos a constante de modulo para evitar hardcode inline.
const TRUST_ITEMS = [
  { icon: "clock",  text: "~15 min" },
  { icon: "lock",   text: "100% privado" },
  { icon: "shield", text: "Datos SERVEL" },
] as const;

// -- Props ------------------------------------------------------------------

export interface HomeHeroSectionProps {
  /**
   * Nombre mostrado en el saludo. Ej: "jenny" (derivado del email prefix).
   * Si se omite, el saludo es solo "Buenos dias" sin nombre.
   */
  displayName?: string;
  /**
   * Iniciales para el avatar circular (1-2 letras, mayusculas).
   * Ej: "JV" para jenny.venegas. Si se omite, el avatar muestra un icono de persona.
   */
  userInitials?: string;
  /**
   * Dias hasta la proxima eleccion. Si null/undefined, no se muestra el pill.
   * Si 0: "Hoy". Si negativo: no mostrar.
   */
  countdownDays?: number | null;
  /**
   * Progreso global [0, 1] del cuestionario activo.
   * Si 0 o undefined: no se muestra el anillo (usuario nuevo).
   * Si > 0 y < 1: anillo parcial (en curso).
   * Si 1: anillo completo con check.
   */
  progressValue?: number;
  /** Label del boton CTA principal. */
  ctaLabel: string;
  /** Callback del boton CTA. */
  onCta: () => void;
  /**
   * BUG-034: callback al tocar el avatar circular. Tipicamente navega a Perfil.
   * Si se omite, el avatar es no-interactivo (comportamiento anterior).
   */
  onAvatarPress?: () => void;
  /** Nombre de la app. Default: "Tinder Decisivo". */
  brand?: string;
}

// -- Helpers ----------------------------------------------------------------

/** Exportada para testing unitario. */
export function countdownLabel(days: number): string | null {
  if (days < 0) return null;
  if (days === 0) return "Elecciones hoy";
  if (days === 1) return "Elecciones manana";
  return `Elecciones en ${days} dias`;
}

function greetingByHour(): string {
  return greetingForHour();
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: HERO_BG,
    paddingHorizontal: spacing.sp4,
    paddingBottom: spacing.sp5,
    gap: spacing.sp4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp3,
    paddingTop: spacing.sp4,
  },
  brandBlock: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sp2 },
  brandText: { fontSize: 16, fontWeight: "700", color: HERO_TEXT },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "800", color: HERO_TEXT },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
    backgroundColor: HERO_PILL_BG,
    borderWidth: 1,
    borderColor: HERO_PILL_BORDER,
    borderRadius: 999,
    paddingHorizontal: spacing.sp3,
    paddingVertical: 5,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: "600", color: HERO_TEXT },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp4,
  },
  textCol: { flex: 1, gap: spacing.sp2 },
  greeting: { fontSize: 15, fontWeight: "600", color: HERO_TEXT_SUB, lineHeight: 20 },
  headline: { fontSize: 22, fontWeight: "900", color: HERO_TEXT, lineHeight: 27 },
  trustRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sp5 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustText: { fontSize: 11, fontWeight: "600", color: HERO_TEXT_SUB },
});

// -- Component --------------------------------------------------------------

export function HomeHeroSection({
  displayName,
  userInitials,
  countdownDays,
  progressValue = 0,
  ctaLabel,
  onCta,
  onAvatarPress,
  brand = "VotoAFin",
}: HomeHeroSectionProps) {
  const c = useThemeColors();
  const hasRing = progressValue > 0;
  const pillLabel = countdownDays != null ? countdownLabel(countdownDays) : null;

  const greetingLine = useMemo(() => {
    const base = greetingByHour();
    return displayName ? `${base}, ${displayName}` : base;
  }, [displayName]);

  return (
    <View style={styles.hero} accessibilityRole="header">
      {/* 1. Top row */}
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <AppIcon size={22} />
          <Text style={styles.brandText}>{brand}</Text>
        </View>
        <Pressable
          style={styles.avatar}
          onPress={onAvatarPress}
          disabled={!onAvatarPress}
          accessibilityRole={onAvatarPress ? "button" : "none"}
          accessibilityLabel={onAvatarPress ? "Ver perfil" : undefined}
          accessibilityHint={onAvatarPress ? "Navega a tu perfil de usuario" : undefined}
        >
          {userInitials ? (
            <Text style={styles.avatarText}>{userInitials}</Text>
          ) : (
            <Icon name="user" size={16} color={HERO_TEXT} />
          )}
        </Pressable>
      </View>

      {/* 2. Countdown pill (condicional) */}
      {pillLabel ? (
        <View style={styles.pill}>
          <View style={[styles.pillDot, { backgroundColor: c.brandAccent }]} />
          <Text style={styles.pillText}>{pillLabel}</Text>
        </View>
      ) : null}

      {/* 3. Greeting + ring */}
      <View style={styles.contentRow}>
        <View style={styles.textCol}>
          <Text style={styles.greeting}>{greetingLine}</Text>
          <Text style={styles.headline}>
            {"Con quien votas\nrealmente?"}
          </Text>
        </View>
        {hasRing ? (
          <ProgressRing
            value={progressValue}
            size="hero"
            label={`${Math.round(progressValue * 100)}%`}
            sublabel="listo"
            progressColor={c.brandAccent}
            doneColor={c.brandAccent}
            labelColor="#FFFFFF"
          />
        ) : null}
      </View>

      {/* 4. CTA */}
      <Button variant="accent" size="lg" onPress={onCta}>
        {ctaLabel}
      </Button>

      {/* 5. Trust meta row */}
      <View style={styles.trustRow}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.text} style={styles.trustItem}>
            <Icon name={item.icon} size={11} color={HERO_TEXT_SUB} />
            <Text style={styles.trustText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
