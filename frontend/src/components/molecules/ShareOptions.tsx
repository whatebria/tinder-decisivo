/**
 * ShareOptions: grid 2x2 de canales sociales. Se usa dentro de un Modal.
 * Cada opcion tiene su color de marca sutil en el icon circle.
 *
 * Movido de organisms/ a molecules/ (TASK-063): composicion presentacional pura sin estado propio.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon, type IconName } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export type ShareChannel = "whatsapp" | "twitter" | "email" | "copy";

export interface ShareOptionsProps {
  onShare: (channel: ShareChannel) => void;
  /** Canales a mostrar. Default: los 4. */
  channels?: ReadonlyArray<ShareChannel>;
  style?: StyleProp<ViewStyle>;
}

const CHANNEL_META: Record<
  ShareChannel,
  { label: string; icon: IconName; tint: string; brand: string }
> = {
  // "tint" es un fondo suave; "brand" el color del icono.
  whatsapp: { label: "WhatsApp", icon: "whatsapp", tint: "#DCF8C6", brand: "#25D366" },
  twitter: { label: "Twitter", icon: "twitter", tint: "#DDEEFF", brand: "#1DA1F2" },
  email: { label: "Email", icon: "mail", tint: "#EDE7F6", brand: "#5E35B1" },
  copy: { label: "Copiar link", icon: "link", tint: "#F5F5F5", brand: "#616161" },
};

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sp3 },
  option: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp3,
    borderWidth: 1,
    borderRadius: radii.rMd,
    paddingVertical: spacing.sp3,
    paddingHorizontal: spacing.sp4,
    minHeight: 56,
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, fontWeight: "500", flexShrink: 1 },
  pressed: { opacity: 0.75 },
});

export function ShareOptions({
  onShare,
  channels = ["whatsapp", "twitter", "email", "copy"],
  style,
}: ShareOptionsProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.grid, style]}>
      {channels.map((ch) => {
        const meta = CHANNEL_META[ch];
        return (
          <Pressable
            key={ch}
            onPress={() => onShare(ch)}
            accessibilityRole="button"
            accessibilityLabel={`Compartir por ${meta.label}`}
            style={(s) => [
              styles.option,
              { backgroundColor: c.card, borderColor: c.border },
              s.pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: meta.tint }]}>
              <Icon name={meta.icon} color={meta.brand} size={20} />
            </View>
            <Text style={[styles.label, { color: c.text }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
