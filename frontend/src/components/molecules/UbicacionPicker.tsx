/**
 * UbicacionPicker: selector cascada Region -> Comuna para setear la comuna
 * donde vota el usuario.
 *
 * Diseno:
 * - 2 "botones tipo dropdown": abren un ListPickerModal cada uno.
 * - Region primero (16 opciones), Comuna despues (filtrada por region + search).
 * - Controlado externo: recibe `value` (ComunaInline | null) y `onChange`.
 * - Boton "quitar mi ubicacion" para volver a matchear con todos los candidatos.
 *
 * Escalable: cuando el backend agregue mas niveles (provincia para CORE,
 * region-visible para senadores), se agregan mas Fields sin romper callers.
 */

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ComunaInline, Region } from "../../api/endpoints";
import { useComunas, useRegiones } from "../../api/hooks";
import { Icon } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { ListPickerModal, type ListPickerItem } from "./ListPickerModal";

/** TASK-040: texto de carga extraido a constante para evitar string hardcodeado. */
const LOADING_TEXT = "Cargando...";


interface UbicacionPickerProps {
  value: ComunaInline | null;
  onChange: (comuna: ComunaInline | null) => void;
  disabled?: boolean;
}

export function UbicacionPicker({
  value,
  onChange,
  disabled,
}: UbicacionPickerProps) {
  const c = useThemeColors();
  const regionesQ = useRegiones();

  // La ComunaInline solo trae region_nombre (no id). Derivamos la Region actual
  // por nombre para el modal de comunas.
  const regionFromValue = useMemo(() => {
    if (!value || !regionesQ.data) return null;
    return regionesQ.data.find((r) => r.nombre === value.region_nombre) ?? null;
  }, [value, regionesQ.data]);

  const [regionLocal, setRegionLocal] = useState<Region | null>(null);
  const region = regionLocal ?? regionFromValue;

  const [regionModal, setRegionModal] = useState(false);
  const [comunaModal, setComunaModal] = useState(false);

  const comunasQ = useComunas(region?.id ?? null);

  function handlePickRegion(r: Region) {
    setRegionLocal(r);
    setRegionModal(false);
    if (value && value.region_nombre !== r.nombre) {
      // Al cambiar de region, la comuna vieja queda invalida.
      onChange(null);
    }
  }

  function handlePickComuna(com: ComunaInline) {
    setComunaModal(false);
    onChange(com);
  }

  function handleClear() {
    setRegionLocal(null);
    onChange(null);
  }

  const regionItems: ListPickerItem[] = useMemo(
    () =>
      (regionesQ.data ?? []).map((r) => ({
        id: r.id,
        title: r.nombre,
        subtitle: r.numero_romano ? `Region ${r.numero_romano}` : undefined,
      })),
    [regionesQ.data],
  );

  const comunaItems: ListPickerItem[] = useMemo(
    () =>
      (comunasQ.data ?? []).map((com) => ({
        id: com.id,
        title: com.nombre,
        subtitle: `Distrito ${com.distrito_numero}`,
      })),
    [comunasQ.data],
  );

  const comunaByIdRef = useMemo(() => {
    const map = new Map<number, ComunaInline>();
    for (const com of comunasQ.data ?? []) map.set(com.id, com);
    return map;
  }, [comunasQ.data]);

  return (
    <View style={styles.root}>
      <Field
        label="Region"
        value={region?.nombre ?? "Elegir region"}
        placeholder="Elegir region"
        onPress={() => setRegionModal(true)}
        disabled={disabled || regionesQ.isLoading}
        loading={regionesQ.isLoading}
      />

      <Field
        label="Comuna"
        value={value?.nombre ?? "Elegir comuna"}
        placeholder="Elegir comuna"
        onPress={() => setComunaModal(true)}
        disabled={disabled || !region}
        muted={!region}
      />

      {value ? (
        <Pressable
          onPress={handleClear}
          disabled={disabled}
          accessibilityRole="button"
          style={styles.clearBtn}
        >
          <Text style={[styles.clearText, { color: c.danger }]}>
            Quitar mi ubicacion
          </Text>
        </Pressable>
      ) : null}

      <ListPickerModal
        visible={regionModal}
        title="Elegir region"
        items={regionItems}
        selectedId={region?.id ?? null}
        searchable={false}
        onSelect={(item) => {
          const r = (regionesQ.data ?? []).find((x) => x.id === item.id);
          if (r) handlePickRegion(r);
        }}
        onClose={() => setRegionModal(false)}
      />

      <ListPickerModal
        visible={comunaModal}
        title="Elegir comuna"
        subtitle={region ? `Region: ${region.nombre}` : undefined}
        items={comunaItems}
        selectedId={value?.id ?? null}
        searchable
        loading={comunasQ.isLoading}
        onSelect={(item) => {
          const com = comunaByIdRef.get(item.id);
          if (com) handlePickComuna(com);
        }}
        onClose={() => setComunaModal(false)}
      />
    </View>
  );
}

// ---------- Field ----------

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  muted?: boolean;
}

function Field({
  label,
  value,
  placeholder,
  onPress,
  disabled,
  loading,
  muted,
}: FieldProps) {
  const c = useThemeColors();
  const isPlaceholder = value === placeholder;

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        style={({ pressed }) => [
          styles.fieldButton,
          {
            backgroundColor: pressed ? c.bg : c.card,
            borderColor: c.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.fieldValue,
            { color: muted || isPlaceholder ? c.textSecondary : c.text },
          ]}
        >
          {/* TASK-040: constante LOADING_TEXT en lugar de string inline. */}
          {loading ? LOADING_TEXT : value}
        </Text>
        {/* TASK-041: Icon chevron-down sustituye el Unicode literal (consistente entre plataformas). */}
        <Icon name="chevron-down" size={16} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sp3 },
  field: { gap: spacing.sp1 },
  fieldLabel: { ...typography.overline, fontWeight: "700" },
  fieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sp3,
    borderWidth: 1,
    borderRadius: radii.rMd,
  },
  fieldValue: { ...typography.body, flex: 1 },

  clearBtn: { alignSelf: "flex-start", paddingVertical: spacing.sp2 },
  clearText: { ...typography.small, fontWeight: "600" },
});
