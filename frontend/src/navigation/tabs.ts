/**
 * Tabs de navegacion principal (bottom nav / sidebar).
 *
 * Fuente de verdad compartida entre `organisms/BottomNav` (movil) y
 * `organisms/Sidebar` (>=900px). Alineado al design-system.html seccion
 * "ORGANISM: BottomNav / Sidebar" y a design-system-lowfi.html.
 */

import type { IconName } from "../components/atoms/Icon";
import { SHOW_NOTICIAS } from "../constants/features";

export type AppTab = "home" | "candidatos" | "comparar" | "noticias" | "config";

export interface AppTabDef {
  key: AppTab;
  route: string;
  icon: IconName;
  label: string;
  /** Label para lectores de pantalla (VoiceOver/TalkBack). Por defecto usa `label`. */
  a11yLabel?: string;
}

/**
 * 5 tabs oficiales, en orden fijo (mismo que el wireframe).
 * Los `icon` son los nombres oficiales del catalogo de Iconos > Navegacion.
 * Tabs controlados por feature flags se filtran aqui: un solo punto de cambio.
 */
const ALL_TABS: readonly AppTabDef[] = [
  { key: "home",       route: "Home",          icon: "home",    label: "Home" },
  { key: "candidatos", route: "Candidatos",    icon: "user",    label: "Candidatos" },
  { key: "comparar",   route: "Comparar",      icon: "columns", label: "Comparar" },
  { key: "noticias",   route: "Noticias",      icon: "news",    label: "Noticias" },
  // UX-037: a11yLabel completo para VoiceOver/TalkBack (el label visible es abreviado).
  { key: "config",     route: "Configuracion", icon: "gear",    label: "Config", a11yLabel: "Configuraci\u00f3n" },
];

export const APP_TABS: readonly AppTabDef[] = ALL_TABS.filter(
  (t) => t.key !== "noticias" || SHOW_NOTICIAS,
);

/** Handler minimo para navegar sin acoplar al tipo especifico de RN Navigation. */
export interface AppTabNavigator {
  navigate: (routeName: string) => void;
}
