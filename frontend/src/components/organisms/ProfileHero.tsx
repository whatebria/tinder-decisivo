/**
 * ProfileHero: header de perfil de candidato. Avatar XL + partido pill +
 * nombre + subtitulo + stats inline. Fondo tinted segun tendencia.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Badge } from "../atoms/Badge";
import { StatBlock } from "../atoms/StatBlock";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

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
  const shadows = useThemeShadows();

  const styles = useMemo(() => {
    const TILT_BG: Record<HeroTilt, string> = {
      left: c.accent2,
      center: c.bg,
      right: c.card,
      default: c.accent2,
    };
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
      name: { fontSize: 26, fontWeight: "700", color: c.text, textAlign: "center" },
      subtitle: { fontSize: 14, color: c.textSecondary, textAlign: "center" },
      stats: {
        flexDirection: "row",
        gap: spacing.sp3,
        marginTop: spacing.sp3,
        alignSelf: "stretch",
      },
      statItem: { flex: 1 },
    });
  }, [c, shadows, tilt]);

  return (
    <View style={[styles.card, style]}>
      <Avatar initials={initials} size="lg" />
      <View style={styles.partido}>
        <Badge variant="info">{partido}</Badge>
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
