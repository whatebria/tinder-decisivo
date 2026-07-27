/**
 * EditarRespuestaModal: modal para cambiar opcion + peso de una respuesta.
 *
 * Muestra:
 * - Enunciado de la pregunta (contexto)
 * - Selector de opciones Likert (5 chips)
 * - Selector de peso (4 chips: No importa / Poco / Importante / Muy importante)
 * - Aviso amarillo: "al guardar se recalcula tu match"
 * - Botones Guardar / Cancelar
 *
 * Refactor: consume <Modal> molecule base (dark mode + tokens reactivos, X
 * de cerrar unificado). Body se auto-scrollea via el Modal.
 */

import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { MiRespuesta } from "../../api/endpoints";
import { Button } from "../atoms/Button";
import { Link } from "../atoms/Link";
import { Modal } from "./Modal";
import { RadioGroup } from "./RadioGroup";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

const PESOS: Array<{ value: number; label: string }> = [
  { value: 0, label: "No me importa" },
  { value: 1, label: "Poco importante" },
  { value: 2, label: "Importante" },
  { value: 3, label: "Muy importante" },
];

interface Props {
  visible: boolean;
  respuesta: MiRespuesta | null;
  onCancel: () => void;
  onSubmit: (opcionId: number, peso: number) => void;
  loading?: boolean;
}

export function EditarRespuestaModal({
  visible,
  respuesta,
  onCancel,
  onSubmit,
  loading = false,
}: Props) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const [opcionId, setOpcionId] = useState<number | null>(null);
  const [peso, setPeso] = useState<number>(1);

  // Reset al abrir con nueva respuesta.
  useEffect(() => {
    if (respuesta) {
      setOpcionId(respuesta.opcion_elegida);
      setPeso(respuesta.peso);
    }
  }, [respuesta]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        eje: {
          fontSize: 11,
          fontWeight: "700",
          color: c.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: spacing.sp1,
        },
        pregunta: {
          fontSize: 16,
          color: c.text,
          fontWeight: "600",
          lineHeight: 22,
          marginBottom: spacing.sp3,
          paddingBottom: spacing.sp3,
          borderBottomWidth: 1,
          borderBottomColor: c.border2,
        },
        sectionTitle: {
          fontSize: 13,
          fontWeight: "700",
          color: c.text,
          marginTop: spacing.sp3,
          marginBottom: spacing.sp2,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        warning: {
          marginTop: spacing.sp4,
          padding: spacing.sp3,
          borderRadius: radii.rSm,
          backgroundColor: isDark ? c.warning800 : c.warning50,
          borderLeftWidth: 3,
          borderLeftColor: c.warning,
        },
        warningText: {
          fontSize: 13,
          color: isDark ? c.warning100 : c.warning700,
          lineHeight: 18,
        },
        actions: { gap: spacing.sp2 },
      }),
    [c, isDark],
  );

  if (!respuesta) return null;

  const changed =
    opcionId !== respuesta.opcion_elegida || peso !== respuesta.peso;

  function handleSubmit() {
    if (opcionId != null) onSubmit(opcionId, peso);
  }

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      dismissOnBackdrop={!loading}
      maxWidth={560}
      footer={
        <View style={styles.actions}>
          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={!changed || opcionId == null}
          >
            Guardar cambios
          </Button>
          <Link block onPress={onCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={styles.eje}>{respuesta.eje_tematico_display}</Text>
      <Text style={styles.pregunta}>{respuesta.pregunta_texto}</Text>

      <Text style={styles.sectionTitle}>Tu respuesta</Text>
      <RadioGroup<number>
        options={respuesta.opciones
          .slice()
          .sort((a, b) => b.valor - a.valor)
          .map((op) => ({ value: op.id, label: op.texto }))}
        value={opcionId}
        onChange={setOpcionId}
        accessibilityLabel="Opciones de respuesta"
      />

      <Text style={styles.sectionTitle}>Que tan importante es para ti</Text>
      <RadioGroup<number>
        options={PESOS.map((p) => ({ value: p.value, label: p.label }))}
        value={peso}
        onChange={setPeso}
        accessibilityLabel="Peso de la respuesta"
      />

      <View style={styles.warning}>
        <Text style={styles.warningText}>
          Al guardar, tu ranking de candidatos se va a recalcular con esta
          nueva respuesta.
        </Text>
      </View>
    </Modal>
  );
}
