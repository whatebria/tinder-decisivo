/**
 * Tabs de navegacion principal (bottom nav / sidebar).
 *
 * Fuente de verdad compartida entre `organisms/BottomNav` (movil) y
 * `organisms/Sidebar` (>=900px). Alineado al design-system.html seccion
 * "ORGANISM: BottomNav / Sidebar" y a design-system-lowfi.html.
 */

import type { IconName } from "../components/atoms/Icon";

export type AppTab = "home" | "guardados" | "comparar" | "noticias" | "config";

export interface AppTabDef {
  key: AppTab;
  route: string;
  icon: IconName;
  label: string;
}

/**
 * 5 tabs oficiales, en orden fijo (mismo que el wireframe).
 * Los `icon` son los nombres oficiales del catalogo de Iconos > Navegacion.
 */
export const APP_TABS: readonly AppTabDef[] = [
  { key: "home",      route: "Home",          icon: "home",     label: "Home" },
  { key: "guardados", route: "MisGuardados",  icon: "bookmark", label: "Guardados" },
  { key: "comparar",  route: "Comparar",      icon: "columns",  label: "Comparar" },
  { key: "noticias",  route: "Noticias",      icon: "news",     label: "Noticias" },
  { key: "config",    route: "Configuracion", icon: "gear",     label: "Config" },
];

/** Handler minimo para navegar sin acoplar al tipo especifico de RN Navigation. */
export interface AppTabNavigator {
  navigate: (routeName: string) => void;
}
