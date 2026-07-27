/**
 * Catalogo de organismos: NAV y SHELL.
 *
 * Incluye: TopNav, HomeTopBar, BottomNav, Sidebar, EmptyState, ErrorBoundary.
 */

import React from "react";
import { Text, View } from "react-native";

import {
  BottomNav,
  EmptyState,
  ErrorBoundary,
  HomeTopBar,
  Sidebar,
  TopNav,
} from "../../../../components";
import { DemoText } from "../../showcase/DemoText";
import type { CatalogEntry } from "../../showcase/types";

// Mock navigator: solo se necesita { navigate }. En el catalogo no navega a nada real.
const mockNav = { navigate: (r: string) => console.log("navigate:", r) };

export const navShellCatalog: CatalogEntry[] = [
  {
    name: "TopNav",
    path: "organisms/TopNav",
    category: "organisms",
    description: "Header minimalista para flujos multi-paso o detalle. Brand + progress opcional + accion opcional.",
    variants: [
      { label: "solo brand", render: () => <TopNav brand="Tinder Decisivo" /> },
      { label: "con progress", render: () => <TopNav brand="Cuestionario" progress={0.4} /> },
      { label: "con action", render: () => <TopNav brand="Editar perfil" actionLabel="Cerrar" onAction={() => {}} /> },
      { label: "completo", render: () => <TopNav brand="Cuestionario" progress={0.75} actionLabel="Cerrar" onAction={() => {}} /> },
    ],
    props: [
      { name: "brand", type: "string", required: true },
      { name: "progress", type: "number", description: "0-1. Si se pasa, muestra barra al medio." },
      { name: "actionLabel", type: "string", description: "Boton ghost a la derecha." },
      { name: "onAction", type: "() => void" },
    ],
    snippet: `import { TopNav } from "../components";

<TopNav
  brand="Cuestionario"
  progress={currentIndex / total}
  actionLabel="Cerrar"
  onAction={() => navigation.goBack()}
/>`,
  },
  {
    name: "HomeTopBar",
    path: "organisms/HomeTopBar",
    category: "organisms",
    description: "Top bar del Home. Brand con icono heart + notif button. Distinta a TopNav (que es para flujos multi-paso).",
    variants: [
      { label: "solo brand", render: () => <HomeTopBar brand="Tinder Decisivo" /> },
      { label: "con notificaciones", render: () => <HomeTopBar brand="Tinder Decisivo" onNotifications={() => {}} /> },
    ],
    props: [
      { name: "brand", type: "string", required: true },
      { name: "onNotifications", type: "() => void", description: "Si se omite, no muestra el boton." },
    ],
    snippet: `import { HomeTopBar } from "../components";

<HomeTopBar
  brand="Tinder Decisivo"
  onNotifications={() => navigate("Notificaciones")}
/>`,
  },
  {
    name: "BottomNav",
    path: "organisms/BottomNav",
    category: "organisms",
    description: "Bottom nav de 5 tabs (variante mobile). Se usa en AppShell cuando el ancho <900px. Tabs: home, guardados, comparar, noticias, config.",
    variants: [
      { label: "active=home", render: () => <View style={{ width: "100%" }}><BottomNav active="home" navigation={mockNav} /></View> },
      { label: "active=noticias", render: () => <View style={{ width: "100%" }}><BottomNav active="noticias" navigation={mockNav} /></View> },
      { label: "active=null (polimorfica)", render: () => <View style={{ width: "100%" }}><BottomNav active={null} navigation={mockNav} /></View> },
    ],
    props: [
      { name: "active", type: "AppTab | null", required: true, description: "'home' | 'guardados' | 'comparar' | 'noticias' | 'config'. Null = pantalla polimorfica." },
      { name: "navigation", type: "AppTabNavigator", required: true, description: "{ navigate: (routeName: string) => void }" },
    ],
    snippet: `import { BottomNav } from "../components";

<BottomNav active="home" navigation={navigation} />`,
  },
  {
    name: "Sidebar",
    path: "organisms/Sidebar",
    category: "organisms",
    description: "Barra de navegacion vertical (variante desktop / tablet landscape). Mismos 5 tabs que BottomNav. Se usa en AppShell cuando ancho >=900px.",
    variants: [
      { label: "active=home", render: () => <View style={{ height: 300, alignItems: "flex-start" }}><Sidebar active="home" navigation={mockNav} /></View> },
      { label: "active=comparar", render: () => <View style={{ height: 300, alignItems: "flex-start" }}><Sidebar active="comparar" navigation={mockNav} /></View> },
    ],
    props: [
      { name: "active", type: "AppTab | null", required: true },
      { name: "navigation", type: "AppTabNavigator", required: true },
    ],
    snippet: `import { Sidebar } from "../components";

<Sidebar active="home" navigation={navigation} />`,
  },
  {
    name: "EmptyState",
    path: "organisms/EmptyState",
    category: "organisms",
    description: "Placeholder cuando no hay datos. Icono central + titulo + descripcion + CTA opcional.",
    variants: [
      {
        label: "minimal",
        render: () => <EmptyState title="Sin resultados" />,
      },
      {
        label: "con descripcion",
        render: () => (
          <EmptyState
            title="No hay candidatos guardados"
            description="Marca tus favoritos desde el ranking para verlos aqui."
          />
        ),
      },
      {
        label: "con CTA",
        render: () => (
          <EmptyState
            icon="bell"
            title="Sin notificaciones nuevas"
            description="Te avisaremos cuando haya novedades sobre tus candidatos favoritos."
            actionLabel="Ir al ranking"
            onAction={() => {}}
          />
        ),
      },
    ],
    props: [
      { name: "icon", type: "IconName", defaultValue: "\"search\"" },
      { name: "title", type: "string", required: true },
      { name: "description", type: "string" },
      { name: "actionLabel", type: "string", description: "Si se omite, no renderiza CTA." },
      { name: "onAction", type: "() => void" },
    ],
    snippet: `import { EmptyState } from "../components";

<EmptyState
  icon="search"
  title="No encontramos resultados"
  description="Prueba con otros filtros o revisa la ortografia."
  actionLabel="Limpiar filtros"
  onAction={clearFilters}
/>`,
  },
  {
    name: "ErrorBoundary",
    path: "organisms/ErrorBoundary",
    category: "organisms",
    description: "Class component. Atrapa errores de render en el arbol. Muestra fallback con boton de reintento. NO atrapa errores en event handlers ni async (eso lo cubre useToast en cada catch).",
    variants: [
      {
        label: "sin error (renderiza children)",
        render: () => (
          <ErrorBoundary>
            <DemoText style={{ padding: 12 }}>Contenido normal renderizado dentro de ErrorBoundary.</DemoText>
          </ErrorBoundary>
        ),
      },
      {
        label: "nota",
        render: () => (
          <View style={{ padding: 12 }}>
            <DemoText tone="secondary" style={{ fontSize: 13 }}>
              Para ver el fallback, tira un throw dentro de un componente hijo en dev.
            </DemoText>
          </View>
        ),
      },
    ],
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Arbol a proteger." },
    ],
    snippet: `import { ErrorBoundary } from "../components";

<ErrorBoundary>
  <AppNavigator />
</ErrorBoundary>`,
  },
];
