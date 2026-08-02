/**
 * Showcase de HomeHeroSection.
 * Hero unificado del Home HUB. Fondo brand-hero (#1C3A52) fijo en light y dark.
 * Reemplaza al HomeTopBar anterior (ver CHANGELOG).
 */

import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { HomeHeroSection } from "./HomeHeroSection";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet" | "status" | "a11y" | "doNotUse" | "relatedTo" | "dsReference"
>;

const showcase: ShowcaseEntry = {
  description:
    "Bloque hero integrado del Home HUB. Unifica la barra de marca (AppIcon + Brand + Avatar), saludo, anillo de progreso (ProgressRing), CTA principal y fila de trust meta. Fondo #1C3A52 (brand-hero) fijo en light y dark.",

  status: "stable",

  dsReference: "DS-11 Brand",

  a11y: [
    "accessibilityRole='banner' en el contenedor raiz (rol de landmark para header).",
    "Contraste #FFFFFF/#1C3A52 = 9.1:1 (AAA).",
    "Contraste texto secundario rgba(255,255,255,0.55) = 4.7:1 (AA).",
    "CTA accent #3A9E7A sobre #FFFFFF = 3.2:1 (AA para UI >= 18px).",
    "CountdownPill: aria-label descriptivo cuando dias <= 30.",
  ],

  doNotUse: [
    "No usar HomeTopBar junto a HomeHeroSection — HomeHeroSection lo reemplaza completamente.",
    "No cambiar HERO_BG con props: el color fijo es identidad de marca (intencional).",
    "No colocar HomeHeroSection dentro de un ScrollView — debe ser sticky en el tope.",
    "No reutilizar en pantallas que no sean HomeScreen: el greeting y el CTA son especificos de Home.",
  ],

  relatedTo: ["AppIcon", "ProgressRing", "HomeTopBar", "ElectionsStrip"],

  variants: [
    {
      label: "match alto (ring visible)",
      render: () => (
        <HomeHeroSection
          displayName="Jenny"
          userInitials="JV"
          progressValue={0.87}
          countdownDays={42}
          onCta={() => {}}
          ctaLabel="Ver mis resultados"
        />
      ),
    },
    {
      label: "sin match todavia (sin ring)",
      render: () => (
        <HomeHeroSection
          displayName="Jenny"
          userInitials="JV"
          progressValue={0}
          countdownDays={null}
          onCta={() => {}}
          ctaLabel="Iniciar cuestionario"
        />
      ),
    },
    {
      label: "dias criticos (<= 30)",
      render: () => (
        <HomeHeroSection
          displayName="Jenny"
          userInitials="JV"
          progressValue={0.72}
          countdownDays={7}
          onCta={() => {}}
          ctaLabel="Ver mis resultados"
        />
      ),
    },
    {
      label: "sin nombre (usuario invitado)",
      render: () => (
        <HomeHeroSection
          progressValue={0}
          countdownDays={null}
          onCta={() => {}}
          ctaLabel="Iniciar cuestionario"
        />
      ),
    },
  ],

  props: [
    { name: "displayName", type: "string", description: "Nombre para el saludo dinamico. Si se omite, solo muestra el greeting sin nombre." },
    { name: "userInitials", type: "string", description: "1-2 letras para el avatar circular. Si se omite, muestra icono de persona." },
    { name: "progressValue", type: "number", defaultValue: "0", description: "Progreso del cuestionario [0, 1]. 0 = sin ring. 1 = ring completo con check." },
    { name: "countdownDays", type: "number | null", description: "Dias hasta la proxima eleccion. null u omitido = oculta el CountdownPill." },
    { name: "onCta", type: "() => void", required: true },
    { name: "ctaLabel", type: "string", required: true },
    { name: "brand", type: "string", defaultValue: '"Tinder Decisivo"', description: "Nombre de la app en la TopRow." },
  ],

  snippet: `import { HomeHeroSection } from "@/components";

// En HomeScreen (fuera del ScrollView, sticky en el tope)
<HomeHeroSection
  displayName={emailPrefix}
  userInitials={initials(emailPrefix)}
  progressValue={respondidas / totalPreguntas}
  countdownDays={diasHastaProximaEleccion}
  onCta={handleHeroCta}
  ctaLabel={heroCta.label}
/>`,
};

export default showcase;
