/**
 * AfinidadTab — tab "Afinidad" del perfil de candidato.
 *
 * UX-059: eleva el contenido de match a jerarquia de tab propia.
 * UX-069: contenido SIEMPRE expandido, agrupado por eje tematico,
 *         con el mismo formato de tarjeta que CompararScreen.
 *
 * Muestra (en orden):
 *   1. RadarChart: afinidad por eje tematico (si hay >= 3 ejes)
 *   2. AfinidadDetalleBody: desglose por eje (solo autenticados)
 *      - Header del eje: nombre + % de coincidencia
 *      - Badges: identicas / cercanas / opuestas
 *      - Lista de posturas: pregunta + tu respuesta + respuesta del candidato
 *
 * Co-located con DetalleCandidatoScreen en screens/DetalleCandidato/.
 * Sin estado propio: todos los datos llegan por props.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useMatchDetalle } from "../../api/hooks";
import type { MatchDetalleItem } from "../../api/endpoints";
import { Badge, RadarChart, Spinner } from "../../components";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

// -- Helpers ---------------------------------------------------------------

function nivelColor(
  item: MatchDetalleItem,
  c: ReturnType<typeof useThemeColors>,
): string {
  if (item.coincide) return c.success;
  if (item.diff >= 3) return c.danger;
  return c.warning;
}

function nivelLabel(item: MatchDetalleItem): string {
  if (item.coincide) return "Identica";
  if (item.diff === 1) return "Cercana";
  if (item.diff === 2) return "Diferente";
  return "Opuesta";
}

function nivelBadgeVariant(item: MatchDetalleItem): "success" | "warning" | "danger" {
  if (item.coincide) return "success";
  if (item.diff >= 3) return "danger";
  return "warning";
}

// -- Sub-components --------------------------------------------------------

interface PosturaRowProps {
  item: MatchDetalleItem;
}

function PosturaRow({ item }: PosturaRowProps) {
  const c = useThemeColors();
  const borderColor = nivelColor(item, c);

  return (
    <View style={[styles.posturaCard, { backgroundColor: c.card, borderLeftColor: borderColor }]}>
      <View style={styles.posturaHeader}>
        <Text style={[styles.posturaLabel, { color: c.textSecondary }]}>
          {nivelLabel(item)}
        </Text>
      </View>
      <Text style={[styles.posturaTexto, { color: c.text }]}>{item.pregunta_texto}</Text>
      <View style={styles.posturaRespuestas}>
        <View style={styles.posturaRespuestaCol}>
          <Text style={[styles.posturaRespuestaTag, { color: c.textSecondary }]}>Tu</Text>
          <Text style={[styles.posturaRespuestaVal, { color: c.text }]}>{item.user_texto}</Text>
        </View>
        <View style={styles.posturaRespuestaDivider} />
        <View style={styles.posturaRespuestaCol}>
          <Text style={[styles.posturaRespuestaTag, { color: c.textSecondary }]}>Candidato</Text>
          <Text style={[styles.posturaRespuestaVal, { color: c.text }]}>{item.candidato_texto}</Text>
        </View>
      </View>
    </View>
  );
}

interface EjeGroupProps {
  ejeDisplay: string;
  pct: number | undefined;
  items: MatchDetalleItem[];
}

function EjeGroup({ ejeDisplay, pct, items }: EjeGroupProps) {
  const c = useThemeColors();
  const identicas = items.filter((i) => i.coincide).length;
  const cercanas = items.filter((i) => !i.coincide && i.diff < 3).length;
  const opuestas = items.filter((i) => i.diff >= 3).length;

  return (
    <View style={styles.ejeGroup}>
      <View style={styles.ejeHeader}>
        <Text style={[styles.ejeNombre, { color: c.text }]}>{ejeDisplay}</Text>
        {pct !== undefined ? (
          <Text style={[styles.ejePct, { color: c.textSecondary }]}>{Math.round(pct)}%</Text>
        ) : null}
      </View>

      <View style={styles.ejeBadges}>
        {identicas > 0 ? (
          <Badge variant="success">{`= ${identicas} identic${identicas === 1 ? "a" : "as"}`}</Badge>
        ) : null}
        {cercanas > 0 ? (
          <Badge variant="warning">{`~ ${cercanas} cercan${cercanas === 1 ? "a" : "as"}`}</Badge>
        ) : null}
        {opuestas > 0 ? (
          <Badge variant="danger">{`X ${opuestas} opuest${opuestas === 1 ? "a" : "as"}`}</Badge>
        ) : null}
      </View>

      <View style={styles.ejeItems}>
        {items.map((item) => (
          <PosturaRow key={item.pregunta_id} item={item} />
        ))}
      </View>
    </View>
  );
}

interface AfinidadDetalleBodyProps {
  candidatoId: number;
  chartData: Record<string, number>;
}

function AfinidadDetalleBody({ candidatoId, chartData }: AfinidadDetalleBodyProps) {
  const c = useThemeColors();
  const query = useMatchDetalle(candidatoId);

  const groupedByEje = useMemo(() => {
    if (!query.data) return [];
    const map = new Map<string, { display: string; pct: number | undefined; items: MatchDetalleItem[] }>();
    for (const item of query.data.items) {
      const existing = map.get(item.eje_tematico);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.eje_tematico, {
          display: item.eje_tematico_display,
          pct: chartData[item.eje_tematico],
          items: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [query.data, chartData]);

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <Spinner size="small" />
      </View>
    );
  }

  if (query.error) {
    return (
      <Text style={[styles.errorText, { color: c.textSecondary }]}>
        No pudimos cargar el detalle. Puede que aun no hayas respondido
        preguntas para este candidato.
      </Text>
    );
  }

  if (!query.data || groupedByEje.length === 0) {
    return (
      <Text style={[styles.errorText, { color: c.textSecondary }]}>
        Responde el cuestionario base para ver el detalle de afinidad.
      </Text>
    );
  }

  return (
    <View style={styles.ejeList}>
      {groupedByEje.map((g) => (
        <EjeGroup
          key={g.display}
          ejeDisplay={g.display}
          pct={g.pct}
          items={g.items}
        />
      ))}
    </View>
  );
}

// -- AfinidadTab -----------------------------------------------------------

export interface AfinidadTabProps {
  /** ID del candidato (para useMatchDetalle). */
  candidatoId: number;
  /**
   * Record<ejeKey, percentage 0-100> del breakdown por eje.
   * Si tiene menos de 3 ejes, el RadarChart no se renderiza.
   */
  chartData: Record<string, number>;
  /** Color del match (verde/amarillo/rojo segun porcentaje). */
  scoreCol: string;
  /** El usuario NO es guest: puede ver el detalle de afinidad. */
  isAuthenticated: boolean;
}

export function AfinidadTab({
  candidatoId,
  chartData,
  scoreCol,
  isAuthenticated,
}: AfinidadTabProps) {
  const c = useThemeColors();
  const hasRadar = Object.keys(chartData).length >= 3;

  return (
    <View style={styles.tabBody}>
      {/* 1. Radar chart por eje */}
      {hasRadar ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Afinidad por eje tematico
          </Text>
          <View style={styles.radarWrap}>
            <RadarChart data={chartData} size={300} color={scoreCol} />
          </View>
        </View>
      ) : null}

      {/* 2. Detalle dimension a dimension -- siempre expandido (UX-069) */}
      {isAuthenticated ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Detalle por dimension
          </Text>
          <AfinidadDetalleBody candidatoId={candidatoId} chartData={chartData} />
        </View>
      ) : null}
    </View>
  );
}

// -- Styles ----------------------------------------------------------------

const styles = StyleSheet.create({
  tabBody: { gap: spacing.sp4, marginTop: spacing.sp1 },
  section: { gap: spacing.sp2 },
  sectionLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  radarWrap: {
    alignItems: "center",
    paddingVertical: spacing.sp2,
  },
  // -- AfinidadDetalleBody
  center: { alignItems: "center", padding: spacing.sp4 },
  errorText: { ...typography.small, textAlign: "center", padding: spacing.sp2 },
  ejeList: { gap: spacing.sp5 },
  // -- EjeGroup
  ejeGroup: { gap: spacing.sp2 },
  ejeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ejeNombre: {
    ...typography.small,
    fontWeight: "700",
  },
  ejePct: {
    ...typography.small,
    fontWeight: "600",
  },
  ejeBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp1,
  },
  ejeItems: { gap: spacing.sp2 },
  // -- PosturaRow
  posturaCard: {
    borderRadius: radii.rMd,
    borderLeftWidth: 4,
    padding: spacing.sp3,
    gap: spacing.sp1,
  },
  posturaHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  posturaLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  posturaTexto: {
    ...typography.small,
    fontWeight: "500",
  },
  posturaRespuestas: {
    flexDirection: "row",
    gap: spacing.sp2,
    marginTop: spacing.sp1,
  },
  posturaRespuestaCol: { flex: 1, gap: 2 },
  posturaRespuestaDivider: { width: 1, backgroundColor: "transparent" },
  posturaRespuestaTag: {
    ...typography.overline,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  posturaRespuestaVal: {
    ...typography.small,
  },
});
