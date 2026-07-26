/**
 * SwipeCard: una tarjeta individual con soporte de swipe gestual.
 *
 * - Usa Animated + PanResponder (funcionan en RN Web sin dependencias).
 * - Threshold configurable (por default 25% del ancho de pantalla).
 * - Al soltar arriba del threshold: anima fuera y dispara callback.
 * - Al soltar debajo: spring back al centro.
 * - Rotacion visual proporcional al desplazamiento X.
 * - Indicadores overlay LIKE / NOPE que aparecen al arrastrar.
 * - Tap corto (sin drag) dispara onTap.
 */

import React, { useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = Math.min(SCREEN_W * 0.25, 140);
const ROTATION_MAX_DEG = 15;
const OUT_DURATION = 220;

export interface SwipeCardProps {
  children: React.ReactNode;
  /** Se ejecuta al swipe hacia la izquierda (descartar / nope). */
  onSwipedLeft: () => void;
  /** Se ejecuta al swipe hacia la derecha (favorito / like). */
  onSwipedRight: () => void;
  /** Tap simple sin drag (ej. abrir detalle). */
  onTap?: () => void;
  /** Si true, deshabilita el gesto (para la card de abajo del stack). */
  disabled?: boolean;
  /** Escala pequenita para dar feedback de "card debajo del stack". */
  scaleBelow?: number;
}

export function SwipeCard({
  children,
  onSwipedLeft,
  onSwipedRight,
  onTap,
  disabled,
  scaleBelow = 1,
}: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const startTime = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, g) =>
          !disabled && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
        onPanResponderGrant: () => {
          startTime.current = Date.now();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          const dt = Date.now() - startTime.current;
          const isTap =
            Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6 && dt < 250;

          if (isTap && onTap) {
            onTap();
            pan.setValue({ x: 0, y: 0 });
            return;
          }

          if (g.dx > SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: SCREEN_W * 1.5, y: g.dy },
              duration: OUT_DURATION,
              useNativeDriver: false,
            }).start(() => {
              onSwipedRight();
              pan.setValue({ x: 0, y: 0 });
            });
          } else if (g.dx < -SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: -SCREEN_W * 1.5, y: g.dy },
              duration: OUT_DURATION,
              useNativeDriver: false,
            }).start(() => {
              onSwipedLeft();
              pan.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              friction: 6,
            }).start();
          }
        },
      }),
    [disabled, onSwipedLeft, onSwipedRight, onTap, pan]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: [`-${ROTATION_MAX_DEG}deg`, "0deg", `${ROTATION_MAX_DEG}deg`],
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const style = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
      { scale: scaleBelow },
    ],
  };

  // Sin gesto: solo tap
  if (disabled) {
    return (
      <Pressable
        onPress={onTap}
        style={[styles.card, { transform: [{ scale: scaleBelow }] }]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.card, style]} {...panResponder.panHandlers}>
      {/* Overlays LIKE / NOPE */}
      <Animated.View
        style={[styles.overlayBadge, styles.likeBadge, { opacity: likeOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.overlayText}>LIKE</Text>
      </Animated.View>
      <Animated.View
        style={[styles.overlayBadge, styles.nopeBadge, { opacity: nopeOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.overlayText}>NOPE</Text>
      </Animated.View>

      <View style={{ flex: 1 }}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayBadge: {
    position: "absolute",
    top: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  likeBadge: {
    right: 20,
    borderColor: "#22C55E",
    transform: [{ rotate: "-18deg" }],
  },
  nopeBadge: {
    left: 20,
    borderColor: "#EF4444",
    transform: [{ rotate: "18deg" }],
  },
  overlayText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
});
