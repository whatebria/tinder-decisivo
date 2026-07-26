/**
 * Explicacion del match user vs candidato: "por que tenemos X% de coincidencia".
 *
 * Muestra un desglose pregunta-a-pregunta con:
 *  - la respuesta del user y la del candidato lado a lado
 *  - si coinciden o no
 *  - el peso que el user asigno a esa pregunta (mas peso = mas influencia)
 *  - un color por eje tematico
 *
 * Colapsable: cerrado por default para no ocupar espacio. Al expandir hace
 * el fetch (lazy con useMatchDetalle enabled=expanded).
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useMatchDetalle } from "../../api/hooks";
import { useThemeColors } from "../../theme/useTheme";

interface Props {
  candidatoId: number | undefined;
}

export function MatchExplanation({ candidatoId }: Props) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const query = useMatchDetalle(expanded ? candidatoId : undefined);

  return (
    <View style={[styles.container, { borderColor: c.border, backgroundColor: c.card }]}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded ? "Ocultar explicacion del match" : "Ver explicacion del match"
        }
      >
        <Text style={[styles.title, { color: c.text }]}>
          {expanded ? "▾" : "▸"} ¿Por que tenemos este match?
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {expanded ? "Toca para ocultar" : "Toca para ver el desglose"}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          {query.isLoading && (
            <Text style={{ color: c.textSecondary }}>Calculando...</Text>
          )}
          {query.error && (
            <Text style={{ color: c.danger }}>
              No pudimos cargar la explicacion. Puede que aun no hayas respondido
              preguntas para este candidato.
            </Text>
          )}
          {query.data && <DetalleBody data={query.data} c={c} />}
        </View>
      )}
    </View>
  );
}

function DetalleBody({
  data,
  c,
}: {
  data: import("../../api/endpoints").MatchDetalle;
  c: ReturnType<typeof useThemeColors>;
}) {
  const coincidencias = data.items.filter((it) => it.coincide).length;
  const totalItems = data.items.length;
  const opuestas = data.items.filter((it) => it.diff >= 3).length;

  return (
    <View style={{ gap: 12 }}>
      {/* Resumen */}
      <View style={{ gap: 4 }}>
        <Text style={{ color: c.text, fontSize: 15 }}>
          <Text style={{ fontWeight: "700" }}>
            {data.match_percentage.toFixed(0)}%
          </Text>
          {"  "}
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>
            (confianza {data.confianza})
          </Text>
        </Text>
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>
          {coincidencias} coincidencias · {opuestas} oposiciones fuertes ·{" "}
          {totalItems} preguntas comparadas
        </Text>
      </View>

      {/* Lista de preguntas ordenadas por contribucion */}
      <View style={{ gap: 8 }}>
        {data.items.map((it) => (
          <ItemRow key={it.pregunta_id} it={it} c={c} />
        ))}
      </View>

      <Text style={{ color: c.textTertiary, fontSize: 11, fontStyle: "italic" }}>
        Orden: las preguntas con mas influencia en tu match aparecen primero.
        El peso que le asignaste a cada pregunta multiplica su influencia.
      </Text>
    </View>
  );
}

function ItemRow({
  it,
  c,
}: {
  it: import("../../api/endpoints").MatchDetalleItem;
  c: ReturnType<typeof useThemeColors>;
}) {
  const bg = c.card;
  const border = it.coincide
    ? c.success
    : it.diff >= 3
      ? c.danger
      : c.border;
  const badge = it.coincide
    ? "Coinciden"
    : it.diff === 1
      ? "Cerca"
      : it.diff === 2
        ? "Diferentes"
        : "Opuestos";

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: bg, borderLeftColor: border },
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.eje, { color: c.textSecondary }]}>
          {it.eje_tematico_display}
        </Text>
        <Text style={[styles.badge, { color: border }]}>{badge}</Text>
      </View>
      <Text style={[styles.pregunta, { color: c.text }]}>{it.pregunta_texto}</Text>
      <View style={{ marginTop: 6, gap: 3 }}>
        <Text style={{ color: c.text, fontSize: 13 }}>
          <Text style={{ fontWeight: "600" }}>Tu:</Text> {it.user_texto}
        </Text>
        <Text style={{ color: c.text, fontSize: 13 }}>
          <Text style={{ fontWeight: "600" }}>Candidato:</Text> {it.candidato_texto}
        </Text>
      </View>
      {it.user_peso_multiplicador !== 1 && (
        <Text style={{ color: c.textTertiary, fontSize: 11, marginTop: 4 }}>
          Peso: x{it.user_peso_multiplicador.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    padding: 14,
    gap: 2,
  },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  body: {
    padding: 14,
    paddingTop: 0,
  },
  item: {
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eje: { fontSize: 11, textTransform: "uppercase", fontWeight: "600" },
  badge: { fontSize: 11, fontWeight: "700" },
  pregunta: { fontSize: 14, fontWeight: "500" },
});
