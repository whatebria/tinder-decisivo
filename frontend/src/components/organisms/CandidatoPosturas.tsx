/**
 * Seccion de posturas de un candidato agrupadas por eje tematico.
 *
 * Muestra cada postura con: pregunta, respuesta del candidato (con color
 * segun valor Likert), y opcionalmente justificacion + link a fuente.
 *
 * Diseniado para ir dentro del DetalleCandidatoScreen (composicion).
 */

import React, { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { PosturaCandidatoDetalle } from "../../api/endpoints";
import { getLikertColor } from "../../services/matching";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

interface Props {
  posturas: PosturaCandidatoDetalle[];
  loading?: boolean;
}

/** Extrae URLs de la justificacion (formato "... (https://...)" comun en fixtures). */
function extractUrl(justificacion: string | null | undefined): string | null {
  if (!justificacion) return null;
  const match = justificacion.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
}

export function CandidatoPosturas({ posturas, loading }: Props) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Agrupa por eje tematico preservando orden por pregunta_orden dentro de cada eje.
  const grupos = useMemo(() => {
    const map = new Map<string, { display: string; items: PosturaCandidatoDetalle[] }>();
    for (const p of posturas) {
      const key = p.eje_tematico;
      if (!map.has(key)) {
        map.set(key, { display: p.eje_tematico_display || key, items: [] });
      }
      map.get(key)!.items.push(p);
    }
    // sort items dentro de cada grupo
    for (const g of map.values()) {
      g.items.sort((a, b) => a.pregunta_orden - b.pregunta_orden);
    }
    return Array.from(map.entries()).map(([key, g]) => ({ key, ...g }));
  }, [posturas]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <Text style={{ color: c.textSecondary }}>Cargando posturas...</Text>
    );
  }

  if (posturas.length === 0) {
    return (
      <Text style={{ color: c.textSecondary }}>
        Aun no hay posturas cargadas para este candidato.
      </Text>
    );
  }

  return (
    <View style={{ gap: spacing.sp6 }}>
      {grupos.map((g) => (
        <View key={g.key} style={{ gap: spacing.sp4 }}>
          <Text style={[styles.ejeTitulo, { color: c.text }]}>{g.display}</Text>
          {g.items.map((p) => {
            const isOpen = expanded.has(p.id);
            const url = extractUrl(p.justificacion);
            const respuestaColor = getLikertColor(p.opcion_respuesta_valor, c, isDark);

            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Text style={[styles.pregunta, { color: c.text }]}>
                  {p.pregunta_texto}
                </Text>
                <Text style={[styles.respuesta, { color: respuestaColor }]}>
                  {p.opcion_respuesta_texto}
                </Text>

                {isOpen && p.justificacion ? (
                  <View style={{ marginTop: spacing.sp2, gap: spacing.sp2 }}>
                    <Text style={[styles.justif, { color: c.textSecondary }]}>
                      {p.justificacion}
                    </Text>
                    {url ? (
                      <Pressable onPress={() => Linking.openURL(url)}>
                        <Text style={[styles.fuente, { color: c.primary }]}>
                          Ver fuente
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}

                <Text style={[styles.hint, { color: c.textSecondary }]}>
                  {isOpen ? "Toca para cerrar" : "Toca para ver justificacion"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ejeTitulo: {
    // typography.body (16px) + bold + capitalize: cabecera de seccion por eje.
    ...typography.body,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  card: {
    padding: spacing.sp3,
    borderRadius: radii.rMd,
    borderWidth: 1,
    gap: spacing.sp1,
  },
  pregunta: {
    ...typography.small,
    fontWeight: "600",
  },
  respuesta: {
    ...typography.small,
    fontWeight: "700",
  },
  justif: {
    ...typography.small,
  },
  fuente: {
    ...typography.small,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  hint: {
    // overline sin uppercase ni letterSpacing exagerado: hint contextual discreto.
    ...typography.overline,
    textTransform: "none",
    letterSpacing: 0,
    marginTop: spacing.sp1,
    fontStyle: "italic",
  },
});
