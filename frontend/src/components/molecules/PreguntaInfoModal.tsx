/**
 * Modal con contexto educativo de una pregunta:
 * - Explicacion neutra de que trata
 * - Repercusiones en 5 dimensiones (economico, social, cultural, ambiental, institucional)
 *
 * Se abre desde CuestionarioScreen al tocar el icono "?" junto al enunciado.
 *
 * Refactor: usa <Modal> molecule base (backdrop + close X unificados,
 * dark mode reactivo). Los colores de las 5 dimensiones se mantienen
 * hardcoded como paleta de dominio (parte del "branding" de los ejes),
 * pero fondos/bordes/textos base van via tokens del theme.
 *
 * Dark mode: cards internas (enunciado + repercusiones) usan c.gray100 que
 * se auto-invierte por tema (light: #EEF0EE sutil sobre card blanco, dark:
 * #2E3532 levemente elevado sobre card oscuro). Antes se hacia
 * `isDark ? c.gray800 : c.bg` que en dark resolvia a c.gray800 = #EEF0EE
 * (blanco), dejando cards blancas dentro del modal oscuro.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal } from "./Modal";
import { Button } from "../atoms/Button";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

// ---- Tipos ----------------------------------------------------------------

export type Repercusiones = Partial<{
  economico: string;
  social: string;
  cultural: string;
  ambiental: string;
  institucional: string;
}>;

type DimensionKey = keyof Repercusiones;

/**
 * Paleta fija por dimension (no va al theme porque es semantica de dominio,
 * no de UI). Los colores estan elegidos con contrast AA sobre fondos claros
 * y oscuros — el chip cambia bg pero el color texto se mantiene.
 */
const DIMENSIONES: Array<{
  key: DimensionKey;
  label: string;
  color: string;
  icon: string;
}> = [
  { key: "economico", label: "Economico", color: "#0F766E", icon: "$" },
  { key: "social", label: "Social", color: "#B45309", icon: "*" },
  { key: "cultural", label: "Cultural", color: "#7C3AED", icon: "~" },
  { key: "ambiental", label: "Ambiental", color: "#166534", icon: "^" },
  { key: "institucional", label: "Institucional", color: "#1E40AF", icon: "#" },
];

// ---- Props ----------------------------------------------------------------

interface Props {
  visible: boolean;
  onClose: () => void;
  pregunta: {
    texto: string;
    eje_tematico_display?: string | null;
    explicacion?: string;
    repercusiones?: unknown;
  } | null;
}

// ---- Componente -----------------------------------------------------------

export function PreguntaInfoModal({ visible, onClose, pregunta }: Props) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        eje: {
          fontSize: 12,
          fontWeight: "600",
          color: c.textSecondary,
          marginBottom: spacing.sp2,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        enunciadoBox: {
          backgroundColor: c.gray100,
          borderRadius: radii.rSm,
          padding: spacing.sp3,
          marginBottom: spacing.sp4,
          borderLeftWidth: 3,
          borderLeftColor: c.border,
        },
        enunciadoText: {
          fontSize: 14,
          color: c.textSecondary,
          fontStyle: "italic",
          lineHeight: 20,
        },
        emptyText: {
          fontSize: 14,
          color: c.textSecondary,
          fontStyle: "italic",
          textAlign: "center",
          padding: spacing.sp5,
        },
        section: {
          marginBottom: spacing.sp4,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: "700",
          color: c.text,
          marginBottom: spacing.sp2,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        bodyText: {
          fontSize: 15,
          color: c.textSecondary,
          lineHeight: 22,
        },
        dimCard: {
          backgroundColor: c.gray100,
          borderLeftWidth: 4,
          borderRadius: radii.rSm,
          padding: spacing.sp3,
          marginBottom: spacing.sp2,
        },
        dimHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.sp1,
        },
        dimIcon: {
          width: 24,
          height: 24,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.sp2,
        },
        dimIconText: {
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: "700",
        },
        dimLabel: {
          fontSize: 14,
          fontWeight: "700",
        },
        dimBody: {
          fontSize: 14,
          color: c.textSecondary,
          lineHeight: 20,
        },
        disclaimer: {
          fontSize: 12,
          color: c.textTertiary,
          fontStyle: "italic",
          marginTop: spacing.sp2,
          textAlign: "center",
          lineHeight: 16,
        },
      }),
    [c],
  );

  if (!pregunta) return null;

  const rep = (pregunta.repercusiones ?? {}) as Repercusiones;
  const hasRep = DIMENSIONES.some((d) => rep[d.key]);
  const hasContent = Boolean(pregunta.explicacion) || hasRep;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Contexto de la pregunta"
      maxWidth={560}
      footer={
        <Button onPress={onClose}>
          Entendido
        </Button>
      }
    >
      {pregunta.eje_tematico_display ? (
        <Text style={styles.eje}>{pregunta.eje_tematico_display}</Text>
      ) : null}

      <View style={styles.enunciadoBox}>
        <Text style={styles.enunciadoText}>{pregunta.texto}</Text>
      </View>

      {!hasContent && (
        <Text style={styles.emptyText}>
          Aun no tenemos contexto para esta pregunta. Estamos trabajando en
          ello.
        </Text>
      )}

      {pregunta.explicacion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>De que se trata</Text>
          <Text style={styles.bodyText}>{pregunta.explicacion}</Text>
        </View>
      ) : null}

      {hasRep && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repercusiones</Text>
          {DIMENSIONES.map((d) => {
            const texto = rep[d.key];
            if (!texto) return null;
            return (
              <View
                key={d.key}
                style={[styles.dimCard, { borderLeftColor: d.color }]}
              >
                <View style={styles.dimHeader}>
                  <View style={[styles.dimIcon, { backgroundColor: d.color }]}>
                    <Text style={styles.dimIconText}>{d.icon}</Text>
                  </View>
                  <Text style={[styles.dimLabel, { color: d.color }]}>
                    {d.label}
                  </Text>
                </View>
                <Text style={styles.dimBody}>{texto}</Text>
              </View>
            );
          })}
        </View>
      )}

      {hasContent && (
        <Text style={styles.disclaimer}>
          Los textos son informativos y neutrales, no una recomendacion de
          voto. Estan en revision con especialistas.
        </Text>
      )}
    </Modal>
  );
}
