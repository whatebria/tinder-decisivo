/**
 * HomeHero: bloque hero del Home. Dos variantes:
 *   - "filled" \u2014 Top match del usuario: kicker + avatar 84px + name/party + score 42px + 2 CTAs.
 *   - "empty"  \u2014 CTA para completar cuestionario: icon 56px + name/desc + progress + CTAs.
 *
 * Ambos con gradiente sutil (aproximado con backgroundColor tinted).
 * RN no soporta gradient nativo; usamos color mezcla precalculado.
 *
 * Ref: design-exploration/design-system.html \u00b7 .home-hero, .home-hero.empty
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Button } from "../atoms/Button";
import { Icon, type IconName } from "../atoms/Icon";
import { Progress } from "../atoms/Progress";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface HomeHeroActionsProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Variant del secondary. Default "secondary". */
  secondaryVariant?: "secondary" | "ghost";
}

export interface HomeHeroFilledProps extends HomeHeroActionsProps {
  variant: "filled";
  /** Ej: "Tu top match hoy". */
  kicker: string;
  candidateName: string;
  candidateParty: string;
  initials: string;
  matchPercent: number;
}

export interface HomeHeroEmptyProps extends HomeHeroActionsProps {
  variant: "empty";
  title: string;
  description: string;
  icon?: IconName;
  /** Progreso 0-1. Default 0. */
  progress?: number;
}

export type HomeHeroProps = HomeHeroFilledProps | HomeHeroEmptyProps;

export function HomeHero(props: HomeHeroProps) {
  const c = useThemeColors();
  const isEmpty = props.variant === "empty";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          // Tint aprox del gradiente: primary/secondary 8% sobre card
          backgroundColor: isEmpty ? withAlpha(c.secondary, 0.08, c.card) : withAlpha(c.primary, 0.08, c.card),
          borderWidth: 1,
          borderColor: c.border2,
          borderRadius: radii.rLg,
          padding: spacing.sp6,
          gap: spacing.sp4,
        },
        kicker: {
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.88,
          color: c.textTertiary,
          fontWeight: "600",
        },
        body: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp5,
          flexWrap: "wrap",
        },
        bodyEmpty: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.sp5,
          flexWrap: "wrap",
        },
        avatarWrap: {
          borderWidth: 3,
          borderColor: c.card,
          borderRadius: 999,
        },
        avatarBig: {
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: c.accent2,
          alignItems: "center",
          justifyContent: "center",
        },
        avatarBigText: {
          fontSize: 32,
          fontWeight: "700",
          color: c.primary,
        },
        ctaIcon: {
          width: 56,
          height: 56,
          borderRadius: radii.rMd,
          backgroundColor: withAlpha(c.secondary, 0.15, c.card),
          alignItems: "center",
          justifyContent: "center",
        },
        info: { flex: 1, minWidth: 200, gap: 4 },
        name: {
          fontSize: 20,
          fontWeight: "700",
          color: c.text,
          lineHeight: 20 * 1.2,
        },
        party: { fontSize: 14, color: c.textSecondary },
        match: {
          alignItems: "flex-end",
          gap: 2,
        },
        matchN: {
          fontSize: 42,
          fontWeight: "700",
          color: c.primary,
          lineHeight: 42,
        },
        matchLbl: {
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.88,
          color: c.textTertiary,
          fontWeight: "600",
        },
        actions: {
          flexDirection: "row",
          gap: spacing.sp2,
          flexWrap: "wrap",
        },
        actionBtn: { flex: 1, minWidth: 140 },
      }),
    [c, isEmpty],
  );

  if (props.variant === "filled") {
    const { kicker, candidateName, candidateParty, initials, matchPercent } = props;
    return (
      <View style={styles.card}>
        <Text style={styles.kicker}>{kicker}</Text>
        <View style={styles.body}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarBigText}>
                {initials.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {candidateName}
            </Text>
            <Text style={styles.party} numberOfLines={2}>
              {candidateParty}
            </Text>
          </View>
          <View style={styles.match}>
            <Text style={styles.matchN}>{Math.round(matchPercent)}%</Text>
            <Text style={styles.matchLbl}>Compatibilidad</Text>
          </View>
        </View>
        <HeroActions {...props} styles={styles} />
      </View>
    );
  }

  // Empty variant
  const { title, description, icon = "search", progress = 0 } = props;
  return (
    <View style={styles.card}>
      <View style={styles.bodyEmpty}>
        <View style={styles.ctaIcon}>
          <Icon name={icon} size={28} color={c.secondary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{title}</Text>
          <Text style={styles.party}>{description}</Text>
        </View>
      </View>
      <Progress value={progress} />
      <HeroActions {...props} styles={styles} />
    </View>
  );
}

function HeroActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryVariant = "secondary",
  styles,
}: HomeHeroActionsProps & { styles: ReturnType<typeof StyleSheet.create> }) {
  return (
    <View style={styles.actions}>
      <Button variant="primary" onPress={onPrimary} style={styles.actionBtn}>
        {primaryLabel}
      </Button>
      {secondaryLabel && onSecondary ? (
        <Button variant={secondaryVariant} onPress={onSecondary} style={styles.actionBtn}>
          {secondaryLabel}
        </Button>
      ) : null}
    </View>
  );
}

/** Mezcla `overlay` sobre `base` con opacidad alpha \u2014 aproxima color-mix() de CSS. */
function withAlpha(overlay: string, alpha: number, base: string): string {
  const [r1, g1, b1] = hexToRgb(overlay);
  const [r2, g2, b2] = hexToRgb(base);
  const r = Math.round(r1 * alpha + r2 * (1 - alpha));
  const g = Math.round(g1 * alpha + g2 * (1 - alpha));
  const b = Math.round(b1 * alpha + b2 * (1 - alpha));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}
