/**
 * Avatar: círculo con iniciales o imagen. Cuatro tamaños + color customizable.
 * Si `imageUrl` está presente, muestra la foto; si no, cae a `initials`.
 */

import React, { useState } from "react";
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
  /** Label de accesibilidad. Default: 'Avatar [INICIALES]'. Sobreescribir con el nombre completo cuando se conozca. */
  accessibilityLabel?: string;
}

// TASK-066: StyleSheet a nivel de modulo para el layout base (estatico).
// dimension, backgroundColor y color se aplican inline (dependen de props/tema).
const s = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  text: { fontWeight: "600" },
});

export function Avatar({
  initials,
  imageUrl,
  size = "md",
  backgroundColor,
  color,
  style,
  accessibilityLabel,
}: AvatarProps) {
  const c = useThemeColors();
  const dim = DIM[size];
  const bg = backgroundColor ?? c.secondary;
  const fg = color ?? c.textOnPrimary;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!imageUrl && !imageFailed;

  const shown = initials.slice(0, 3).toUpperCase();
  const circleDim = { width: dim.size, height: dim.size, borderRadius: dim.size / 2 };

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Avatar ${shown}`}
      style={[s.base, circleDim, { backgroundColor: bg }, style]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl as string }}
          style={circleDim}
          onError={() => setImageFailed(true)}
          resizeMode="cover"
        />
      ) : (
        <Text style={[s.text, { color: fg, fontSize: dim.fontSize }]}>{shown}</Text>
      )}
    </View>
  );
}
