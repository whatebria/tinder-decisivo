/**
 * Icon: set minimo de iconos SVG del design system (stroke 2, currentColor).
 * Ver: design-exploration/design-system.html section "Iconos".
 *
 * Todos usan viewBox 24x24. `color` reemplaza a currentColor.
 * Para tamano, usar prop `size` (default 20).
 */

import React from "react";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";

export type IconName =
  | "chevron-right"
  | "chevron-left"
  | "check"
  | "close"
  | "info"
  | "alert"
  | "clock"
  | "user"
  | "heart"
  | "undo"
  | "search"
  | "plus"
  | "whatsapp"
  | "twitter"
  | "mail"
  | "link"
  | "bell"
  | "settings"
  | "newspaper"
  | "compare"
  | "swipe";

export interface IconProps {
  name: IconName;
  /** Tamano en px. Default 20. */
  size?: number;
  /** Color del stroke. Default: currentColor (hereda del padre). */
  color?: string;
  /** Ancho del stroke. Default: 2. */
  strokeWidth?: number;
  /** Para variantes filled (ej. heart en favoritos). Default: "none". */
  fill?: string;
}

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  fill = "none",
}: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon(name, common)}
    </Svg>
  );
}

function renderIcon(name: IconName, p: object) {
  switch (name) {
    case "chevron-right":
      return <Polyline points="9 18 15 12 9 6" {...p} />;
    case "chevron-left":
      return <Polyline points="15 18 9 12 15 6" {...p} />;
    case "check":
      return <Polyline points="20 6 9 17 4 12" {...p} />;
    case "close":
      return (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" {...p} />
          <Line x1="6" y1="6" x2="18" y2="18" {...p} />
        </>
      );
    case "info":
      return (
        <>
          <Circle cx="12" cy="12" r="10" {...p} />
          <Line x1="12" y1="16" x2="12" y2="12" {...p} />
          <Line x1="12" y1="8" x2="12.01" y2="8" {...p} />
        </>
      );
    case "alert":
      return (
        <>
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" {...p} />
          <Line x1="12" y1="9" x2="12" y2="13" {...p} />
          <Line x1="12" y1="17" x2="12.01" y2="17" {...p} />
        </>
      );
    case "clock":
      return (
        <>
          <Circle cx="12" cy="12" r="10" {...p} />
          <Polyline points="12 6 12 12 16 14" {...p} />
        </>
      );
    case "user":
      return (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...p} />
          <Circle cx="12" cy="7" r="4" {...p} />
        </>
      );
    case "heart":
      return (
        <Path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          {...p}
        />
      );
    case "undo":
      return (
        <>
          <Path d="M3 12a9 9 0 1 0 9-9" {...p} />
          <Polyline points="3 5 3 12 10 12" {...p} />
        </>
      );
    case "search":
      return (
        <>
          <Circle cx="11" cy="11" r="8" {...p} />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" {...p} />
        </>
      );
    case "plus":
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...p} />
          <Line x1="5" y1="12" x2="19" y2="12" {...p} />
        </>
      );
    case "whatsapp":
      // Filled brand icon: sobrescribimos fill y omitimos stroke.
      return (
        <Path
          d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.83c0 2.08.55 4.11 1.6 5.9L.1 24l6.44-1.68a11.85 11.85 0 0 0 5.5 1.4h.01c6.53 0 11.83-5.3 11.84-11.83a11.77 11.77 0 0 0-3.37-8.4zM12.05 21.7h-.01a9.8 9.8 0 0 1-5.02-1.37l-.36-.22-3.73.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.24c0-5.44 4.43-9.87 9.87-9.87 2.63 0 5.11 1.03 6.98 2.9a9.79 9.79 0 0 1 2.89 6.98c0 5.44-4.43 9.86-9.87 9.86z"
          fill={(p as { stroke?: string }).stroke ?? "currentColor"}
        />
      );
    case "twitter":
      return (
        <Path
          d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
          fill={(p as { stroke?: string }).stroke ?? "currentColor"}
        />
      );
    case "mail":
      return (
        <>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" {...p} />
          <Polyline points="22,6 12,13 2,6" {...p} />
        </>
      );
    case "link":
      return (
        <>
          <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" {...p} />
          <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" {...p} />
        </>
      );
    case "bell":
      return (
        <>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...p} />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...p} />
        </>
      );
    case "settings":
      return (
        <>
          <Circle cx="12" cy="12" r="3" {...p} />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            {...p}
          />
        </>
      );
    case "newspaper":
      return (
        <>
          <Path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" {...p} />
          <Path d="M18 14h-8" {...p} />
          <Path d="M15 18h-5" {...p} />
          <Path d="M10 6h8v4h-8V6Z" {...p} />
        </>
      );
    case "compare":
      // 4 corners frame — para "Comparador"
      return (
        <>
          <Path d="M8 3H5a2 2 0 0 0-2 2v3" {...p} />
          <Path d="M21 8V5a2 2 0 0 0-2-2h-3" {...p} />
          <Path d="M3 16v3a2 2 0 0 0 2 2h3" {...p} />
          <Path d="M16 21h3a2 2 0 0 0 2-2v-3" {...p} />
        </>
      );
    case "swipe":
      // Card con flechita up — para "Modo swipe"
      return (
        <>
          <Path d="M3 4h18a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...p} />
          <Polyline points="8 12 12 8 16 12" {...p} />
        </>
      );
  }
}
