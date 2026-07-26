/**
 * Radios de esquina. Curvas suaves para sensacion no-agresiva.
 * Full para chips, badges y avatars.
 */
export const radii = {
  rSm: 6,
  rMd: 10,
  rLg: 14,
  rXl: 20,
  rFull: 9999,
} as const;

export type RadiusKey = keyof typeof radii;
