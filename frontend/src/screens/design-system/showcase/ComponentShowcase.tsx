/**
 * ComponentShowcase: card contenedora por cada componente del catalogo.
 *
 * Estructura:
 *  1. Header (nombre + path + descripcion)
 *  2. Variantes visuales (VariantGrid) - siempre visible
 *  3. Toggle Props (colapsable, default cerrado)
 *  4. Toggle Copy & paste (colapsable, default cerrado)
 */

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../../theme/useTheme";
import { CodeBlock } from "./CodeBlock";
import { PropsTable } from "./PropsTable";
import { VariantGrid } from "./VariantGrid";
import type { CatalogEntry, ComponentStatus } from "./types";

// ---------------------------------------------------------------------------
// Badge de estado del componente
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<ComponentStatus, { bg: string; text: string; label: string }> = {
  stable:       { bg: "#dcfce7", text: "#166534", label: "Estable" },
  experimental: { bg: "#fef9c3", text: "#854d0e", label: "Experimental" },
  deprecated:   { bg: "#fee2e2", text: "#991b1b", label: "Deprecado" },
  removed:      { bg: "#f3f4f6", text: "#6b7280", label: "Eliminado" },
};

function StatusBadge({ status }: { status: ComponentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
        backgroundColor: s.bg,
        alignSelf: "flex-start",
      }}
      accessibilityLabel={`Estado: ${s.label}`}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: s.text }}>{s.label}</Text>
    </View>
  );
}

interface ComponentShowcaseProps {
  entry: CatalogEntry;
}

export function ComponentShowcase({ entry }: ComponentShowcaseProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [propsOpen, setPropsOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [doNotOpen, setDoNotOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border,
          padding: spacing.sp5,
          marginBottom: spacing.sp6,
          ...shadows.shSm,
        },
        header: {
          marginBottom: spacing.sp4,
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: spacing.sp3,
        },
        name: {
          fontSize: 22,
          fontWeight: "700",
          color: c.text,
        },
        path: {
          fontSize: 12,
          fontFamily: "monospace",
          color: c.textTertiary,
        },
        description: {
          fontSize: 14,
          color: c.textSecondary,
          marginTop: spacing.sp2,
          lineHeight: 20,
        },
        sectionLabel: {
          fontSize: 11,
          fontWeight: "700",
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginTop: spacing.sp5,
          marginBottom: spacing.sp3,
        },
        toggleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          marginTop: spacing.sp5,
          paddingVertical: spacing.sp2,
          borderTopWidth: 1,
          borderTopColor: c.border,
        },
        togglePressed: {
          opacity: 0.6,
        },
        toggleChevron: {
          fontSize: 12,
          color: c.textSecondary,
          fontWeight: "700",
          width: 12,
        },
        toggleLabel: {
          fontSize: 11,
          fontWeight: "700",
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          flex: 1,
        },
        toggleCount: {
          fontSize: 11,
          color: c.textTertiary,
          fontWeight: "500",
        },
        collapsibleBody: {
          marginTop: spacing.sp3,
        },
      }),
    [c, shadows],
  );

  const anchorId = `ds-${entry.category}-${entry.name.toLowerCase()}`;
  const anchorProps = { nativeID: anchorId } as const;

  return (
    <View style={styles.card} {...anchorProps}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{entry.name}</Text>
          <Text style={styles.path}>{entry.sourcePath ?? `src/components/${entry.path}.tsx`}</Text>
          {entry.status && entry.status !== "stable" ? (
            <StatusBadge status={entry.status} />
          ) : null}
        </View>
        <Text style={styles.description}>{entry.description}</Text>
        {entry.deprecatedBy ? (
          <Text style={[styles.description, { color: c.danger, marginTop: spacing.sp1 }]}>
            Usar en su lugar: {entry.deprecatedBy}
          </Text>
        ) : null}
        {entry.dsReference ? (
          <Text style={[styles.description, { color: c.textTertiary, marginTop: spacing.sp1 }]}>
            ■ {entry.dsReference}
          </Text>
        ) : null}
      </View>

      <Text style={styles.sectionLabel}>Variantes</Text>
      <VariantGrid variants={entry.variants} />

      {entry.doNotUse && entry.doNotUse.length > 0 ? (
        <CollapsibleSection
          label="Cuando NO usar"
          open={false}
          onToggle={() => setDoNotOpen((v) => !v)}
          styles={styles}
          forceOpen={doNotOpen}
        >
          <View style={{ gap: spacing.sp1 }}>
            {entry.doNotUse.map((rule, i) => (
              <Text key={i} style={[styles.description, { color: c.danger }]}> {rule}</Text>
            ))}
          </View>
        </CollapsibleSection>
      ) : null}

      {entry.a11y && entry.a11y.length > 0 ? (
        <CollapsibleSection
          label="Accesibilidad"
          open={false}
          onToggle={() => setA11yOpen((v) => !v)}
          styles={styles}
          forceOpen={a11yOpen}
        >
          <View style={{ gap: spacing.sp1 }}>
            {entry.a11y.map((note, i) => (
              <Text key={i} style={[styles.description, { color: c.info }]}> {note}</Text>
            ))}
          </View>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        label="Props"
        count={entry.props.length}
        open={propsOpen}
        onToggle={() => setPropsOpen((v) => !v)}
        styles={styles}
      >
        <PropsTable props={entry.props} />
      </CollapsibleSection>

      <CollapsibleSection
        label="Copy & paste"
        open={codeOpen}
        onToggle={() => setCodeOpen((v) => !v)}
        styles={styles}
      >
        <CodeBlock code={entry.snippet} />
      </CollapsibleSection>
    </View>
  );
}

// ---------------------------------------------------------------------------

interface CollapsibleSectionProps {
  label: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof StyleSheet.create<any>>;
  children: React.ReactNode;
  /** Permite que el caller controle el estado abierto externamente. */
  forceOpen?: boolean;
}

function CollapsibleSection({
  label,
  count,
  open,
  onToggle,
  styles,
  children,
  forceOpen,
}: CollapsibleSectionProps) {
  const isOpen = forceOpen !== undefined ? forceOpen : open;
  return (
    <>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${isOpen ? "Ocultar" : "Mostrar"} ${label}`}
        style={({ pressed }) => [styles.toggleRow, pressed && styles.togglePressed]}
      >
        <Text style={styles.toggleChevron}>{isOpen ? "\u25BE" : "\u25B8"}</Text>
        <Text style={styles.toggleLabel}>{label}</Text>
        {count !== undefined ? (
          <Text style={styles.toggleCount}>{count}</Text>
        ) : null}
      </Pressable>
      {isOpen ? <View style={styles.collapsibleBody}>{children}</View> : null}
    </>
  );
}
