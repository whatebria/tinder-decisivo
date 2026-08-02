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
          userName="Jenny"
          matchPercent={87}
          diasHastaEleccion={42}
          onCta={() => {}}
          ctaLabel="Ver mis resultados"
          ctaVariant="accent"
          showTrust
        />
      ),
    },
    {
      label: "sin match todavia (sin ring)",
      render: () => (
        <HomeHeroSection
          userName="Jenny"
          matchPercent={null}
          diasHastaEleccion={null}
          onCta={() => {}}
          ctaLabel="Iniciar cuestionario"
          ctaVariant="accent"
          showTrust
        />
      ),
    },
    {
      label: "dias criticos (<= 30)",
      render: () => (
        <HomeHeroSection
          userName="Jenny"
          matchPercent={72}
          diasHastaEleccion={7}
          onCta={() => {}}
          ctaLabel="Ver mis resultados"
          ctaVariant="accent"
          showTrust={false}
        />
      ),
    },
  ],

  props: [
    { name: "userName", type: "string", required: true, description: "Nombre del usuario para el saludo dinamico." },
    { name: "matchPercent", type: "number | null", description: "0-100. null = no hay match aun (oculta el ProgressRing)." },
    { name: "diasHastaEleccion", type: "number | null", description: "Dias hasta la proxima eleccion. null = oculta el CountdownPill." },
    { name: "onCta", type: "() => void", required: true },
    { name: "ctaLabel", type: "string", required: true },
    { name: "ctaVariant", type: '"accent" | "primary" | "ghost"', defaultValue: '"accent"', description: "variant='accent' (#3A9E7A) es el aprobado para el CTA sobre fondo hero." },
    { name: "showTrust", type: "boolean", defaultValue: "true", description: "Muestra la fila de trust meta (~15 min | 100% privado | Datos SERVEL)." },
  ],

  snippet: `import { HomeHeroSection } from "@/components";

// En HomeScreen (fuera del ScrollView, sticky en el tope)
<HomeHeroSection
  userName={user.nombre}
  matchPercent={topMatch?.match_percentage ?? null}
  diasHastaEleccion={diasHastaProximaEleccion}
  onCta={handleHeroCta}
  ctaLabel={heroCta.label}
  ctaVariant="accent"
  showTrust={!hasCompletedAny}
/>`,
};

export default showcase;
