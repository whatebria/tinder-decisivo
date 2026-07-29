/**
 * ElectionCard: card de una eleccion activa en el Home HUB.
 *
 * Basado en design-system-lowfi.html · Home HUB (rediseno 2026-07-28).
 *
 * 3 variantes:
 *   - active: eleccion actualmente seleccionada (border-2 primary)
 *   - secondary: otra eleccion activa (border-1 gris)
 *   - pending: sin cuestionario respondido aún (progress 0%)
 *
 * MODO PRINCIPAL (recomendado): pasar `respondidas` + `totalPreguntas`. La
 * card muestra "N de N preguntas" y la progress bar. El porcentaje de match
 * NO se muestra aca — ahora vive en su propio hero card (MatchSummaryCard)
 * en la seccion "Tus mejores matches" del Home. Razon: separar dos conceptos
 * distintos (avance del cuestionario vs afinidad politica) que antes se
 * mezclaban confundiendo al user.
 *
 * MODO LEGACY (deprecado): pasar `matchPercent` + `progressPercent`. Se
 * conserva por back-compat mientras la HomeScreen migra. Si `respondidas`
 * y `totalPreguntas` estan definidos, ganan y `matchPercent` se ignora.
 *
 * Prop `esBase`:
 *   Cuando true, la card representa un TipoEleccion con es_base=true
 *   ("Preguntas generales" transversal). No tiene candidatos propios, entonces:
 *     - se sustituye el `scope` por un chip "APLICA A TODAS"
 *     - se muestra un sub-texto explicativo en vez del progreso/match
 *   El resto (badge, onPress) sigue igual.
 *
 * Badge (esquina sup. derecha):
 *   - "Completado" (verde) si isCompleted === true
 *   - "Pendiente" (neutro) si isCompleted === false
 *   - Sin badge si isCompleted === undefined (util para skeletons/loading)
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import {
  computeProgresoRatio,
  formatProgresoLabel,
} from "../../domain/eleccion";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Progress } from "./Progress";

export type ElectionCardVariant = "active" | "secondary" | "pending";

export interface ElectionCardProps {
  name: string;
  scope?: string;
  /** Si el user ya completo el cuestionario. Si undefined, no se muestra badge. */
  isCompleted?: boolean;
  /**
   * Progreso del cuestionario en preguntas absolutas. Modo recomendado.
   * Si ambos vienen, la card muestra "N de N preguntas" y calcula la barra
   * a partir de estos valores (matchPercent y progressPercent se ignoran).
   */
  respondidas?: number;
  totalPreguntas?: number;
  /**
   * @deprecated Usar `respondidas` + `totalPreguntas`. El match% vive ahora
   * en MatchSummaryCard. Se mantiene solo por back-compat mientras la
   * HomeScreen migra.
   */
  matchPercent?: number | null;
  /**
   * @deprecated Usar `respondidas` + `totalPreguntas` (la barra se deriva).
   * Se mantiene por back-compat.
   */
  progressPercent?: number;
  /**
   * @deprecated En el nuevo diseno el sub-texto siempre es el label de
   * progreso. Se mantiene solo para el modo legacy.
   */
  pendingLabel?: string;
  /**
   * Si true, esta card representa un TipoEleccion con es_base=true.
   * Cambia el UI: oculta progreso, muestra chip "APLICA A TODAS" y sub-texto.
   */
  esBase?: boolean;
  /** Texto explicativo custom para cards con esBase=true. Default: 'Mejora tus matches en todas las elecciones'. */
  baseHint?: string;
  variant?: ElectionCardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const CARD_WIDTH = 180;

/**
 * Deriva label + colores del badge segun isCompleted. Funcion pura.
 */
function pickBadge(
  isCompleted: boolean | undefined,
): { label: string; tone: "success" | "neutral" } | null {
  if (isCompleted === undefined) return null;
  return isCompleted
    ? { label: "Completado", tone: "success" }
    : { label: "Pendiente", tone: "neutral" };
}

export function ElectionCard({
  name,
  scope,
  isCompleted,
  respondidas,
  totalPreguntas,
  matchPercent,
  progressPercent,
  pendingLabel,
  esBase = false,
  baseHint,
  variant = "secondary",
  onPress,
  style,
  accessibilityLabel,
}: ElectionCardProps) {
  const c = useThemeColors();
  const isActive = variant === "active";

  // Modo nuevo: si vienen respondidas + totalPreguntas, calculamos label y
  // barra desde el dominio puro. Es el path recomendado. Modo legacy (con
  // matchPercent) se conserva mientras la HomeScreen migra.
  const modoProgreso = respondidas !== undefined && totalPreguntas !== undefined;
  const progresoLabel = modoProgreso
    ? formatProgresoLabel(respondidas!, totalPreguntas!)
    : null;
  const progresoRatio = modoProgreso
    ? computeProgresoRatio(respondidas!, totalPreguntas!)
    : Math.max(0, Math.min(100, progressPercent ?? 0)) / 100;

  // esBase pisa el flag de pending porque ni el progreso ni el match% tienen
  // sentido en estas cards.
  const isPendingLegacy =
    !esBase && !modoProgreso && (variant === "pending" || matchPercent == null);

  const badge = pickBadge(isCompleted);
  const badgeColors = useMemo(() => {
    if (!badge) return null;
    switch (badge.tone) {
      case "success":
        return { bg: c.success, fg: c.textOnPrimary };
      case "neutral":
      default:
        return { bg: c.accent2, fg: c.textSecondary };
    }
  }, [badge, c]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          padding: spacing.sp3,
          borderRadius: radii.rLg,
          gap: spacing.sp2,
          backgroundColor: c.card,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? c.primary : c.border2,
          flexShrink: 0,
        },
        headRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing.sp2,
        },
        titleCol: { flex: 1, gap: 2 },
        name: {
          fontSize: 14,
          fontWeight: "600",
          color: c.text,
          lineHeight: 18,
        },
        scope: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: c.textSecondary,
          fontWeight: "600",
        },
        baseChip: {
          alignSelf: "flex-start",
          paddingHorizontal: spacing.sp2,
          paddingVertical: 2,
          borderRadius: radii.rFull,
          backgroundColor: c.accent2,
          marginTop: 2,
        },
        baseChipText: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: c.primary,
          fontWeight: "700",
        },
        badge: {
          paddingHorizontal: spacing.sp2,
          paddingVertical: 2,
          borderRadius: radii.rFull,
          flexShrink: 0,
        },
        badgeText: {
          fontSize: 11,
          fontWeight: "700",
        },
        matchRow: {
          flexDirection: "row",
          alignItems: "baseline",
          gap: spacing.sp1,
        },
        matchN: {
          fontSize: 22,
          fontWeight: "700",
          color: isActive ? c.primary : c.text,
        },
        matchPct: {
          fontSize: 12,
          color: c.textSecondary,
        },
        pendingText: {
          fontSize: 11,
          color: c.textSecondary,
        },
        progresoText: {
          fontSize: 13,
          fontWeight: "600",
          color: c.text,
        },
      }),
    [c, isActive],
  );

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.headRow}>
        <View style={styles.titleCol}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {esBase ? (
            <View style={styles.baseChip}>
              <Text style={styles.baseChipText}>Aplica a todas</Text>
            </View>
          ) : scope ? (
            <Text style={styles.scope}>{scope}</Text>
          ) : null}
        </View>
        {badge && badgeColors ? (
          <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.badgeText, { color: badgeColors.fg }]}>
              {badge.label}
            </Text>
          </View>
        ) : null}
      </View>

      {esBase ? (
        <Text style={styles.pendingText}>
          {baseHint ?? "Mejora tus matches en todas las elecciones"}
        </Text>
      ) : modoProgreso ? (
        <Text style={styles.progresoText}>{progresoLabel}</Text>
      ) : isPendingLegacy ? (
        <Text style={styles.pendingText}>{pendingLabel ?? "Sin cuestionario"}</Text>
      ) : (
        <View style={styles.matchRow}>
          <Text style={styles.matchN}>{Math.round(matchPercent ?? 0)}</Text>
          <Text style={styles.matchPct}>%</Text>
        </View>
      )}

      <Progress value={progresoRatio} />
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Eleccion ${name}`}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      {content}
    </Pressable>
  );
}
