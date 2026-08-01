/**
 * TopMatchSection: card de primer lugar del ranking electoral.
 *
 * Encapsula:
 *   - Banner de resultado preliminar (cuando confianza == TENTATIVA)
 *   - ResultadoHero (avatar + nombre + match% + radar + badge confianza)
 *   - BookmarkActions (favorito / descartar, solo para usuarios auth)
 *
 * Extraido del IIFE anonimo de ResultadosScreen (REFACTOR-004).
 * Recibe los datos ya derivados para evitar recalculos en el render.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { MatchResult } from "../../api/endpoints";
import {
  BookmarkActions,
  Icon,
  ResultadoHero,
} from "../index";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { withAlpha } from "../../theme/utils";
import { useThemeColors } from "../../theme/useTheme";
import {
  getConfianzaBadge,
  getConfianzaBadgeVariant,
  isConfianzaTentativa,
} from "../../services/matching";

// ---- Props ----------------------------------------------------------------

export interface TopMatchSectionProps {
  /** Resultado del candidato #1 del ranking. */
  result: MatchResult;
  /** Color hex del tier de afinidad (ya calculado por el screen). */
  matchColor: string;
  /** Datos del radar chart (ya derivados de breakdownToChartData). */
  chartData: Record<string, number>;
  /** Si el candidato esta en favoritos del usuario. */
  isFavorito: boolean;
  /** Si el usuario esta en modo invitado (oculta BookmarkActions). */
  isGuest: boolean;
  /** Navegar al perfil completo del candidato. */
  onDetalle: () => void;
  /** Toggle favorito. Recibe el candidatoId. */
  onToggleFav: (id: number) => void;
  /** Toggle descartar. Recibe el candidatoId. */
  onToggleDesc: (id: number) => void;
  /** True mientras una mutacion de bookmark esta en vuelo. */
  loadingBookmarks: boolean;
}

// ---- Componente -----------------------------------------------------------

export function TopMatchSection({
  result,
  matchColor,
  chartData,
  isFavorito,
  isGuest,
  onDetalle,
  onToggleFav,
  onToggleDesc,
  loadingBookmarks,
}: TopMatchSectionProps) {
  const c = useThemeColors();

  const pct = Number(result.match_percentage);
  const conf = getConfianzaBadge(result.confianza);
  const esTentativa = isConfianzaTentativa(result.confianza ?? undefined);
  const candidato = result.candidato_data;
  const candId = candidato.id!;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: spacing.sp3 },
        banner: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.sp3,
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
        },
        bannerText: {
          flex: 1,
          ...typography.small,
          lineHeight: 18,
        },
      }),
    [],
  );

  return (
    <View style={styles.wrap}>
      {esTentativa ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: withAlpha(c.warning, 0.13), borderColor: c.warning },
          ]}
        >
          <Icon name="alert" size={18} color={c.warning} />
          <Text style={[styles.bannerText, { color: c.text }]}>
            <Text style={{ fontWeight: "700" }}>Resultado preliminar. </Text>
            Solo se compararon{" "}
            <Text style={{ fontWeight: "700" }}>
              {result.preguntas_consideradas}{" "}
              {result.preguntas_consideradas === 1 ? "pregunta" : "preguntas"}
            </Text>
            . Responde m\u00e1s para afinar tu afinidad.
          </Text>
        </View>
      ) : null}

      <ResultadoHero
        nombre={candidato.nombre}
        apellido={candidato.apellido}
        partido={candidato.partido}
        imageUrl={candidato.profile_picture}
        matchPct={pct}
        matchColor={matchColor}
        ejeScores={chartData}
        confianzaLabel={`Confianza ${conf.label.toLowerCase()}`}
        confianzaVariant={getConfianzaBadgeVariant(result.confianza ?? undefined)}
        confianzaSubtext={`${result.preguntas_consideradas} ${
          result.preguntas_consideradas === 1 ? "pregunta coincide" : "preguntas coinciden"
        }`}
        onCta={onDetalle}
      />

      {!isGuest ? (
        <BookmarkActions
          isFavorito={isFavorito}
          isDescartado={false}
          onToggleFavorito={() => onToggleFav(candId)}
          onToggleDescartado={() => onToggleDesc(candId)}
          loading={loadingBookmarks}
          size="sm"
        />
      ) : null}
    </View>
  );
}
