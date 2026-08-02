/**
 * Modal con contexto educativo de una pregunta:
 * - Explicacion neutra de que trata
 * - Repercusiones en 5 dimensiones (economico, social, cultural, ambiental, institucional)
 *
 * Se abre desde CuestionarioScreen al tocar el icono "?" junto al enunciado.
 *
 * La paleta de las 5 dimensiones vive en `src/domain/dimensiones.ts` y se
 * consume via <DimensionCard/> — este modal solo compone. Ver la token
 * page del design system para detalle de contraste WCAG AA por variante.
 *
 * Dark mode: cards internas (enunciado + repercusiones) usan c.gray100 que
 * se auto-invierte por tema (light: sutil sobre card blanco, dark: sutil
 * sobre card oscuro). Los colores por dimension se resuelven light/dark
 * automaticamente dentro de DimensionCard.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal } from "./Modal";
import { DimensionCard } from "./DimensionCard";
import { Button } from "../atoms/Button";
import { DIMENSIONES, type DimensionKey } from "../../domain/dimensiones";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

// ---- Tipos ----------------------------------------------------------------

export type Repercusiones = Partial<Record<DimensionKey, string>>;

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

// ---- Styles ---------------------------------------------------------------

const styles = StyleSheet.create({
  eje: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: spacing.sp2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  enunciadoBox: {
    borderRadius: radii.rSm,
    padding: spacing.sp3,
    marginBottom: spacing.sp4,
    borderLeftWidth: 3,
  },
  enunciadoText: { fontSize: 14, fontStyle: "italic", lineHeight: 20 },
  emptyText: { fontSize: 14, fontStyle: "italic", textAlign: "center", padding: spacing.sp5 },
  section: { marginBottom: spacing.sp4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sp2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bodyText: { fontSize: 15, lineHeight: 22 },
  disclaimer: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: spacing.sp2,
    textAlign: "center",
    lineHeight: 16,
  },
});

// ---- Componente -----------------------------------------------------------

export function PreguntaInfoModal({ visible, onClose, pregunta }: Props) {
  const c = useThemeColors();

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
      footer={<Button onPress={onClose}>Entendido</Button>}
    >
      {pregunta.eje_tematico_display ? (
        <Text style={[styles.eje, { color: c.textSecondary }]}>{pregunta.eje_tematico_display}</Text>
      ) : null}

      <View style={[styles.enunciadoBox, { backgroundColor: c.gray100, borderLeftColor: c.border }]}>
        <Text style={[styles.enunciadoText, { color: c.textSecondary }]}>{pregunta.texto}</Text>
      </View>

      {!hasContent && (
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          Aun no tenemos contexto para esta pregunta. Estamos trabajando en
          ello.
        </Text>
      )}

      {pregunta.explicacion ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>De que se trata</Text>
          <Text style={[styles.bodyText, { color: c.textSecondary }]}>{pregunta.explicacion}</Text>
        </View>
      ) : null}

      {hasRep && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Repercusiones</Text>
          {DIMENSIONES.map((d) => {
            const texto = rep[d.key];
            if (!texto) return null;
            return (
              <DimensionCard key={d.key} dimension={d.key}>
                {texto}
              </DimensionCard>
            );
          })}
        </View>
      )}

      {hasContent && (
        <Text style={[styles.disclaimer, { color: c.textTertiary }]}>
          Los textos son informativos y neutrales, no una recomendacion de
          voto. Estan en revision con especialistas.
        </Text>
      )}
    </Modal>
  );
}
