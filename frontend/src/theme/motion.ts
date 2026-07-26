/**
 * Duraciones y easing para animaciones.
 * En Reanimated: usar como `withTiming(value, { duration: motion.durBase, easing: Easing.bezierFn(...) })`.
 */

export const motion = {
  durFast: 120,
  durBase: 180,
  durSlow: 320,
} as const;

/** Bezier curve: (0.4, 0, 0.2, 1) — el standard de Material Design. */
export const easeBezier = [0.4, 0, 0.2, 1] as const;

export type MotionKey = keyof typeof motion;
