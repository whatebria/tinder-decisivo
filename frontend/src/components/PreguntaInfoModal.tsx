/**
 * Modal con contexto educativo de una pregunta:
 * - Explicacion neutra de que trata
 * - Repercusiones en 5 dimensiones (economico, social, cultural, ambiental, institucional)
 *
 * Se abre desde CuestionarioScreen al tocar el icono "?" junto al enunciado.
 *
 * Implementado con RN Modal + Pressable para evitar bugs de Tamagui en RN Web.
 */

import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ---- Tipos ----------------------------------------------------------------

export type Repercusiones = Partial<{
  economico: string;
  social: string;
  cultural: string;
  ambiental: string;
  institucional: string;
}>;

type DimensionKey = keyof Repercusiones;

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
  if (!pregunta) return null;

  const rep = (pregunta.repercusiones ?? {}) as Repercusiones;
  const hasRep = DIMENSIONES.some((d) => rep[d.key]);
  const hasContent = Boolean(pregunta.explicacion) || hasRep;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
    <Text style={styles.title}>Contexto de la pregunta</Text>
              {pregunta.eje_tematico_display ? (
                <Text style={styles.eje}>{pregunta.eje_tematico_display}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Cerrar contexto"
              hitSlop={12}
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Enunciado como recordatorio */}
            <View style={styles.enunciadoBox}>
              <Text style={styles.enunciadoText}>{pregunta.texto}</Text>
            </View>

            {!hasContent && (
              <Text style={styles.emptyText}>
                Aun no tenemos contexto para esta pregunta. Estamos trabajando en
                ello.
              </Text>
            )}

            {/* Explicacion general */}
            {pregunta.explicacion ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>De que se trata</Text>
                <Text style={styles.bodyText}>{pregunta.explicacion}</Text>
              </View>
            ) : null}

            {/* Repercusiones por dimension */}
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
                        <View
                          style={[styles.dimIcon, { backgroundColor: d.color }]}
                        >
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

            {/* Disclaimer */}
            {hasContent && (
              <Text style={styles.disclaimer}>
                Los textos son informativos y neutrales, no una recomendacion de
                voto. Estan en revision con especialistas.
              </Text>
            )}
          </ScrollView>

          {/* Footer */}
          <Pressable
            onPress={onClose}
            style={styles.footerBtn}
            accessibilityLabel="Cerrar y volver a la pregunta"
          >
            <Text style={styles.footerText}>Entendido</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---- Estilos --------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  eje: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  scroll: {
    flexGrow: 0,
  },
  enunciadoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#9CA3AF",
  },
  enunciadoText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  dimCard: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  dimHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dimIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
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
    color: "#374151",
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  footerBtn: {
    marginTop: 12,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
