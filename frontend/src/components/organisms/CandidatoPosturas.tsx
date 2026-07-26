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
import { useThemeColors } from "../../theme/useTheme";

interface Props {
  posturas: PosturaCandidatoDetalle[];
  loading?: boolean;
}

/** Color segun valor Likert (1=muy en desacuerdo -> 5=muy de acuerdo). */
function colorForValor(valor: number, c: ReturnType<typeof useThemeColors>): string {
  if (valor >= 4) return c.success;
  if (valor <= 2) return c.danger;
  return c.textSecondary;
}

/** Extrae URLs de la justificacion (formato "... (https://...)" comun en fixtures). */
function extractUrl(justificacion: string | null): string | null {
  if (!justificacion) return null;
  const match = justificacion.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
}

export function CandidatoPosturas({ posturas, loading }: Props) {
  const c = useThemeColors();
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
    <View style={{ gap: 24 }}>
      {grupos.map((g) => (
        <View key={g.key} style={{ gap: 14 }}>
          <Text style={[styles.ejeTitulo, { color: c.text }]}>{g.display}</Text>
          {g.items.map((p) => {
            const isOpen = expanded.has(p.id);
            const url = extractUrl(p.justificacion);
            const respuestaColor = colorForValor(p.opcion_respuesta_valor, c);

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
                  <View style={{ marginTop: 8, gap: 6 }}>
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
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  pregunta: { fontSize: 14, fontWeight: "600" },
  respuesta: { fontSize: 14, fontWeight: "700" },
  justif: { fontSize: 13, lineHeight: 18 },
  fuente: { fontSize: 13, fontWeight: "600", textDecorationLine: "underline" },
  hint: { fontSize: 11, marginTop: 6, fontStyle: "italic" },
});
