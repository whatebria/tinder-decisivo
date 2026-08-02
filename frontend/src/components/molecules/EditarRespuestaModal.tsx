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

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { MiRespuesta } from "../../api/endpoints";
import { Button } from "../atoms/Button";
import { Divider } from "../atoms/Divider";
import { Link } from "../atoms/Link";
import { Modal } from "./Modal";
import { RadioGroup } from "./RadioGroup";
import { PESOS, separarOpciones } from "../../services/cuestionario";
import { blurActiveElement } from "../../hooks/blurActiveElement";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

interface Props {
  visible: boolean;
  respuesta: MiRespuesta | null;
  onCancel: () => void;
  onSubmit: (opcionId: number, peso: number) => void;
  loading?: boolean;
}

const styles = StyleSheet.create({
  eje: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sp1,
  },
  pregunta: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: spacing.sp3,
    paddingBottom: spacing.sp3,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sp3,
    marginBottom: spacing.sp2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  warning: {
    marginTop: spacing.sp4,
    padding: spacing.sp3,
    borderRadius: radii.rSm,
    borderLeftWidth: 3,
  },
  warningText: { fontSize: 13, lineHeight: 18 },
  actions: { gap: spacing.sp2 },
  noSeLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.sp2,
    marginBottom: spacing.sp1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

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

  if (!respuesta) return null;

  const changed =
    opcionId !== respuesta.opcion_elegida || peso !== respuesta.peso;

  // BUG-027: separar opciones regulares de "No sé" -- consistente con CuestionarioScreen.
  const { regulares, noSe } = separarOpciones(
    respuesta.opciones as Parameters<typeof separarOpciones>[0]
  );

  const opcionesRegulares = regulares
    .slice()
    .sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0))
    .map((op) => ({ value: op.id as number, label: op.texto ?? "" }));

  const opcionNoSeMapped =
    noSe?.id != null
      ? { value: noSe.id as number, label: noSe.texto ?? "No sé" }
      : null;

  // Blur al elemento con foco ANTES de que el padre haga setState(false).
  function handleSubmit() {
    if (opcionId == null) return;
    blurActiveElement();
    onSubmit(opcionId, peso);
  }
  function handleCancel() {
    blurActiveElement();
    onCancel();
  }

  const warningBg = isDark ? c.warning800 : c.warning50;
  const warningTextColor = isDark ? c.warning100 : c.warning700;

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
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
          <Link block onPress={handleCancel} disabled={loading}>
            Cancelar
          </Link>
        </View>
      }
    >
      <Text style={[styles.eje, { color: c.textTertiary }]}>{respuesta.eje_tematico_display}</Text>
      <Text style={[styles.pregunta, { color: c.text, borderBottomColor: c.border2 }]}>
        {respuesta.pregunta_texto}
      </Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Tu respuesta</Text>
      {/* BUG-027: RadioGroup solo con opciones Likert; "No sé" separada con Divider. */}
      <RadioGroup<number>
        options={opcionesRegulares}
        value={opcionId}
        onChange={setOpcionId}
        accessibilityLabel="Opciones de respuesta"
      />
      {opcionNoSeMapped ? (
        <>
          <Divider style={{ marginVertical: spacing.sp1 }} />
          <Text style={[styles.noSeLabel, { color: c.textSecondary }]}>Sin postura definida</Text>
          <RadioGroup<number>
            options={[opcionNoSeMapped]}
            value={opcionId}
            onChange={setOpcionId}
          />
        </>
      ) : null}

      <Text style={[styles.sectionTitle, { color: c.text }]}>Que tan importante es para ti</Text>
      <RadioGroup<number>
        options={PESOS.map((p) => ({ value: p.value, label: p.labelLargo }))}
        value={peso}
        onChange={setPeso}
        accessibilityLabel="Peso de la respuesta"
      />

      <View style={[styles.warning, { backgroundColor: warningBg, borderLeftColor: c.warning }]}>
        <Text style={[styles.warningText, { color: warningTextColor }]}>
          Al guardar, tu ranking de candidatos se va a recalcular con esta
          nueva respuesta.
        </Text>
      </View>
    </Modal>
  );
}
