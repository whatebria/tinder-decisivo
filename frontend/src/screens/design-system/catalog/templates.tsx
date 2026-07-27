/**
 * Catalogo de templates.
 *
 * Solo hay 1: AppShell. Layout responsive con BottomNav (mobile) o Sidebar (desktop).
 */

import React from "react";
import { ScrollView, View } from "react-native";

import { AppShell } from "../../../components";
import { DemoText } from "../showcase/DemoText";
import type { CatalogEntry } from "../showcase/types";

const mockNav = { navigate: (r: string) => console.log("navigate:", r) };

export const templatesCatalog: CatalogEntry[] = [
  {
    name: "AppShell",
    path: "templates/AppShell",
    category: "templates",
    description: "Layout responsive que envuelve las screens post-auth. <900px: BottomNav abajo. >=900px: Sidebar a la izquierda. Los children ocupan flex:1 en ambos casos.",
    variants: [
      {
        label: "shell (verlo en tu ancho actual)",
        render: () => (
          <View style={{ height: 400, borderWidth: 1, borderColor: "#ccc" }}>
            <AppShell active="home" navigation={mockNav}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12 }}>
                <DemoText style={{ fontSize: 18, fontWeight: "700" }}>Screen contents</DemoText>
                <DemoText tone="secondary" style={{ fontSize: 13 }}>
                  Los children ocupan flex:1. Si tu ventana es &lt;900px veras BottomNav abajo,
                  si es &gt;=900px veras Sidebar a la izquierda. Recomendacion: cambia el ancho de la ventana para verlo.
                </DemoText>
                <DemoText tone="secondary" style={{ fontSize: 13 }}>
                  Nota: el shell renderizado dentro del design system esta constrainted a 400px de alto para no romper el layout del browser.
                </DemoText>
              </ScrollView>
            </AppShell>
          </View>
        ),
      },
    ],
    props: [
      { name: "active", type: "AppTab | null", required: true, description: "Tab activa. null = pantalla polimorfica." },
      { name: "navigation", type: "AppTabNavigator", required: true, description: "{ navigate: (routeName: string) => void }" },
      { name: "children", type: "ReactNode", required: true },
      { name: "contentStyle", type: "StyleProp<ViewStyle>", description: "Escape hatch para override del contenedor de children." },
    ],
    snippet: `import { AppShell } from "../components";

// En cada screen post-auth:
export function HomeScreen({ navigation }) {
  return (
    <AppShell active="home" navigation={navigation}>
      <YourScreenContent />
    </AppShell>
  );
}

// SIDEBAR_BREAKPOINT = 900. Screens que NO usan AppShell:
// Splash, Onboarding, Ubicacion, Login, Signup, Cuestionario.`,
  },
];
