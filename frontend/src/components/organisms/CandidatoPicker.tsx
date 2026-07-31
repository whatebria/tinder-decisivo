/**
 * CandidatoPicker — selector de candidato con sub-filtros propios.
 *
 * Muestra la lista de candidatos como chips seleccionables, con dos
 * sub-filtros locales (Eleccion y Partido) que reducen la lista visible
 * sin afectar el estado del padre.
 *
 * Los sub-filtros son encapsulados: el padre solo sabe que candidato
 * quedo seleccionado, no como el usuario llego a esa eleccion.
 *
 * Nota: el schema de Candidato del frontend NO incluye region/comuna
 * (aunque el backend los tiene). Filtrar por territorio requiere extender
 * CandidatoSerializer y regenerar los tipos — por ahora solo eleccion
 * y partido.
 *
 * Usado en: NoticiasScreen (filtro de candidato en sheet de filtros).
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { Candidato, TipoEleccion } from "../../api/endpoints";
import { Chip } from "../atoms/Chip";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface CandidatoPickerProps {
  candidatos: Candidato[];
  tiposEleccion: TipoEleccion[];
  /** Candidato actualmente seleccionado. `null` = todos. */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CandidatoPicker({
  candidatos,
  tiposEleccion,
  selectedId,
  onSelect,
}: CandidatoPickerProps) {
  const c = useThemeColors();
  const [tipoEleccionId, setTipoEleccionId] = useState<number | null>(null);
  const [partido, setPartido] = useState<string | null>(null);

  // Partidos derivados del data (evita otra fuente de verdad).
  const partidos = useMemo(() => {
    const set = new Set<string>();
    for (const cand of candidatos) if (cand.partido) set.add(cand.partido);
    return Array.from(set).sort();
  }, [candidatos]);

  // Candidatos filtrados por eleccion + partido (sub-filtros locales).
  const filtrados = useMemo(() => {
    return candidatos.filter((cand) => {
      if (cand.id == null) return false;
      if (
        tipoEleccionId != null &&
        !(cand.tipos_eleccion ?? []).includes(tipoEleccionId)
      ) {
        return false;
      }
      if (partido != null && cand.partido !== partido) return false;
      return true;
    });
  }, [candidatos, tipoEleccionId, partido]);

  return (
    <View style={styles.wrap}>
      {/* Sub-filtro: Eleccion */}
      <Text style={[styles.subLabel, { color: c.textSecondary }]}>
        Eleccion
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subRow}
      >
        <Chip
          active={tipoEleccionId === null}
          onPress={() => setTipoEleccionId(null)}
        >
          Todas
        </Chip>
        {tiposEleccion
          .filter((t) => t.id != null)
          .map((t) => (
            <Chip
              key={t.id}
              active={tipoEleccionId === t.id}
              onPress={() => setTipoEleccionId(t.id!)}
            >
              {t.nombre}
            </Chip>
          ))}
      </ScrollView>

      {/* Sub-filtro: Partido (solo si hay 2 o mas opciones) */}
      {partidos.length > 1 ? (
        <>
          <Text style={[styles.subLabel, { color: c.textSecondary }]}>
            Partido
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subRow}
          >
            <Chip active={partido === null} onPress={() => setPartido(null)}>
              Todos
            </Chip>
            {partidos.map((p) => (
              <Chip
                key={p}
                active={partido === p}
                onPress={() => setPartido(p)}
              >
                {p}
              </Chip>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Divider visual entre sub-filtros y lista de candidatos */}
      <View style={[styles.divider, { backgroundColor: c.border }]} />

      {/* Lista de candidatos filtrada */}
      <Text style={[styles.subLabel, { color: c.textSecondary }]}>
        {filtrados.length === candidatos.length
          ? `Todos (${filtrados.length})`
          : `${filtrados.length} de ${candidatos.length}`}
      </Text>
      <View style={styles.chipsGrid}>
        <Chip active={selectedId === null} onPress={() => onSelect(null)}>
          Todos
        </Chip>
        {filtrados.map((cand) => (
          <Chip
            key={cand.id}
            active={selectedId === cand.id}
            onPress={() => onSelect(cand.id!)}
          >
            {`${cand.nombre} ${cand.apellido ?? ""}`.trim()}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sp2,
  },
  subLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  subRow: {
    gap: spacing.sp2,
    alignItems: "center",
    paddingVertical: spacing.sp1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sp2,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp2,
  },
});
