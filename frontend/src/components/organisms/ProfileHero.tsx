/**
 * ProfileHero: header de perfil de candidato. Avatar XL + partido pill +
 * nombre + subtitulo + stats inline. Fondo tinted segun tendencia.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Badge } from "../atoms/Badge";
import { StatBlock } from "../atoms/StatBlock";
import { tints } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors, useThemeShadows } from "../../theme/useTheme";

export type HeroTilt = "left" | "center" | "right" | "default";

export interface HeroStat {
  value: string | number;
  label: string;
}

export interface ProfileHeroProps {
  name: string;
  initials: string;
  partido: string;
  /** Subtitulo (ej. "Presidente de Chile · 38 anios · Magallanes"). */
  subtitle: string;
  stats?: ReadonlyArray<HeroStat>;
  /** Tendencia para el tint de fondo. Default "default". */
  tilt?: HeroTilt;
  style?: StyleProp<ViewStyle>;
}

export function ProfileHero({
  name,
  initials,
  partido,
  subtitle,
  stats,
  tilt = "default",
  style,
}: ProfileHeroProps) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const shadows = useThemeShadows();

  const styles = useMemo(() => {
    // UX-039: el fondo del hero debe ser el azul institucional (c.primary),
    // no c.accent2 que es el token de hover.
    // BUG-015: en dark mode c.primary = #7BB5D4 (azul claro), ratio con texto
    // blanco = 2.2:1 < 4.5:1 requerido WCAG AA. Se usa primary800 (#1B3D53,
    // ~10:1) para garantizar contraste. Ambos fixes van juntos.
    const heroBg = isDark ? tints.primary800 : c.primary;
    const TILT_BG: Record<HeroTilt, string> = {
      left: heroBg,
      center: c.bg,
      right: c.card,
      default: heroBg,
    };

    // Texto sobre heroBg: primary light (#2E5F7E) ratio ~5.5:1 con blanco;
    // primary800 dark (#1B3D53) ratio ~10:1 con blanco.
    // "center" y "right" usan fondos normales -> tokens de texto del theme.
    const isOnHeroBg = tilt === "left" || tilt === "default";
    const nameColor = isOnHeroBg ? "#FFFFFF" : c.text;
    const subtitleColor = isOnHeroBg ? "rgba(255,255,255,0.78)" : c.textSecondary;

    return StyleSheet.create({
      card: {
        backgroundColor: TILT_BG[tilt],
        borderRadius: radii.rXl,
        padding: spacing.sp6,
        alignItems: "center",
        gap: spacing.sp3,
        ...shadows.shSm,
      },
      partido: { alignSelf: "center" },
      name: { fontSize: 26, fontWeight: "700", color: nameColor, textAlign: "center" },
      subtitle: { fontSize: 14, color: subtitleColor, textAlign: "center" },
      stats: {
        flexDirection: "row",
        gap: spacing.sp3,
        marginTop: spacing.sp3,
        alignSelf: "stretch",
      },
      statItem: { flex: 1 },
    });
  }, [c, isDark, shadows, tilt]);

  return (
    <View style={[styles.card, style]}>
      <Avatar initials={initials} size="lg" />
      <View style={styles.partido}>
        {/* UX-042: variant neutral para identidad politica, no "info" (DS-04 semantica) */}
        <Badge variant="neutral">{partido}</Badge>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {stats && stats.length > 0 ? (
        <View style={styles.stats}>
          {stats.map((s, i) => (
            <View key={`${s.label}-${i}`} style={styles.statItem}>
              <StatBlock value={s.value} label={s.label} variant="primary" />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
