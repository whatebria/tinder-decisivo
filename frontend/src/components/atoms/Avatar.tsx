/**
 * Avatar: c\u00edrculo con iniciales o imagen. Cuatro tama\u00f1os + color customizable.
 * Si `imageUrl` est\u00e1 presente, muestra la foto; si no, cae a `initials`.
 */

import React, { useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const DIM: Record<AvatarSize, { size: number; fontSize: number }> = {
  sm: { size: 32, fontSize: 12 },
  md: { size: 44, fontSize: 16 },
  lg: { size: 64, fontSize: 22 },
  xl: { size: 96, fontSize: 32 },
};

export interface AvatarProps {
  /** Iniciales - se cortan a 3 caracteres y se pasan a mayusculas. */
  initials: string;
  /** URL de la foto. Si esta presente y carga OK, reemplaza a las iniciales. */
  imageUrl?: string | null;
  size?: AvatarSize;
  /** Color del fondo (solo para fallback initials). Default: secondary. */
  backgroundColor?: string;
  /** Color del texto (solo para fallback initials). Default: textOnPrimary. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({
  initials,
  imageUrl,
  size = "md",
  backgroundColor,
  color,
  style,
}: AvatarProps) {
  const c = useThemeColors();
  const dim = DIM[size];
  const bg = backgroundColor ?? c.secondary;
  const fg = color ?? c.textOnPrimary;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!imageUrl && !imageFailed;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: dim.size,
          height: dim.size,
          borderRadius: dim.size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        image: { width: dim.size, height: dim.size },
        text: { color: fg, fontSize: dim.fontSize, fontWeight: "600" },
      }),
    [dim, bg, fg],
  );

  const shown = initials.slice(0, 3).toUpperCase();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar ${shown}`}
      style={[styles.base, style]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl as string }}
          style={styles.image}
          onError={() => setImageFailed(true)}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.text}>{shown}</Text>
      )}
    </View>
  );
}
