/**
 * ThemeToggle: control segmentado para cambiar modo claro / oscuro / sistema.
 * Persistente via useThemeStore. Reactivo al tema actual.
 */

import React from "react";

import { Tabs } from "./Tabs";
import { useThemeStore, type ThemeMode } from "../../store/theme";
import { useThemeColors } from "../../theme/useTheme";

export interface ThemeToggleProps {
  /** Si es true, oculta el label superior (util cuando ya hay un titulo cerca). */
  hideLabel?: boolean;
}

const ITEMS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export function ThemeToggle(_props: ThemeToggleProps = {}) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  // TASK-031: DS-11 P8 -- toggle activo usa brandSecondary (verde), no primary (azul).
  const c = useThemeColors();

  return (
    <Tabs<ThemeMode>
      value={mode}
      onChange={(v) => {
        void setMode(v);
      }}
      items={ITEMS}
      activeColor={c.secondary}
    />
  );
}
