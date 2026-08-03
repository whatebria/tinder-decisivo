/**
 * OnboardingScreen: welcome tour de 5 slides que se muestra la primera vez
 * que el usuario abre la app (flag persistido en `useOnboardingStore`).
 *
 * Al completar (o saltar), marca el flag y `AppNavigator` swappea al auth stack.
 *
 * Slide 5 tiene 3 CTAs con **intenciones distintas**:
 *   - "Crear cuenta"       → setea pendingAuthTarget="Register" → RegisterScreen
 *   - "Ya tengo cuenta"    → sin target → LoginScreen (default)
 *   - "Explorar sin cuenta"→ enterGuestMode → MainStack
 *
 * El copy vive en `content/welcomeTour.ts` (source of truth, testeable).
 */

import React, { useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Button, Heading, Link } from "../components";
import { OnboardingEleccionesDemo } from "./Onboarding/OnboardingEleccionesDemo";
import { OnboardingPreguntaDemo }   from "./Onboarding/OnboardingPreguntaDemo";
import { OnboardingResultadosDemo } from "./Onboarding/OnboardingResultadosDemo";
import { WELCOME_SLIDES } from "../content/welcomeTour";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { useElectionsPrefsStore } from "../store/electionsPrefs";
import { useOnboardingStore } from "../store/onboarding";
import { useTiposEleccion } from "../api/hooks";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

/** Slides que incluyen un demo interactivo debajo del body text. */
const DEMO_SLIDE_IDS = new Set(["welcome-2", "welcome-3", "welcome-4"]);

/**
 * Los CTAs finales viven en el último slide de `WELCOME_SLIDES`. Los
 * extraemos una vez a nivel de módulo para no depender del índice runtime.
 */
const FINAL_CTAS = WELCOME_SLIDES[WELCOME_SLIDES.length - 1].finalCtas;

export function OnboardingScreen(_: RootStackScreenProps<"Onboarding"> | RootStackScreenProps<"OnboardingPreview">) {
  // Acepta tanto la ruta normal como la ruta de preview dev.
  // Necesitamos acceso a navigation.goBack() y route.name, asi que
  // casteamos el prop al tipo base de React Navigation.
  const props = _ as { navigation: { goBack: () => void }; route: { name: string } };
  const isPreview = props.route.name === "OnboardingPreview";
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const setPendingAuthTarget = useOnboardingStore((s) => s.setPendingAuthTarget);
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);
  const c = useThemeColors();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  // useWindowDimensions() reactivo — importante en web (resize) y tablets (rotacion).
  const { width } = useWindowDimensions();

  // Datos reales para slide 2 (UX-010).
  // El query solo se dispara si estamos cerca del slide 2; Onboarding es
  // pre-auth, pero useTiposEleccion no requiere autenticacion.
  const tiposQ = useTiposEleccion();
  const tipos = tiposQ.data ?? [];
  const allTipoIds = tipos.map((t) => t.id).filter((id): id is number => id != null);
  // DEBUG: solo elecciones 2025 activas por defecto en el onboarding.
  const tipos2025 = tipos.filter((t) => t.anio === 2025);
  const tipos2025Ids = tipos2025.map((t) => t.id).filter((id): id is number => id != null);
  const activeIds = useElectionsPrefsStore((s) => s.activeIds);
  const toggleEleccion = useElectionsPrefsStore((s) => s.toggle);
  const initializeElections = useElectionsPrefsStore((s) => s.initializeIfNull);

  function handleToggleEleccion(id: number) {
    toggleEleccion(id, allTipoIds);
  }

  const totalSlides = WELCOME_SLIDES.length;
  const isLastSlide = index === totalSlides - 1;

  /** Salta al auth stack aterrizando en Login (default). */
  async function finishToLogin() {
    if (isPreview) { props.navigation.goBack(); return; }
    await initializeElections(tipos2025Ids);
    setPendingAuthTarget(null);
    await markSeen();
  }

  /** Salta al auth stack aterrizando directo en Register. */
  async function finishToRegister() {
    if (isPreview) { props.navigation.goBack(); return; }
    await initializeElections(tipos2025Ids);
    setPendingAuthTarget("Register");
    await markSeen();
  }

  /** Entra al main stack en modo invitado. */
  async function finishAsGuest() {
    if (isPreview) { props.navigation.goBack(); return; }
    await initializeElections(tipos2025Ids);
    setPendingAuthTarget(null);
    await markSeen();
    enterGuestMode();
  }

  function goToSlide(next: number) {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  }

  function handleNext() {
    if (!isLastSlide) goToSlide(index + 1);
  }

  function handleBack() {
    if (index > 0) goToSlide(index - 1);
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) setIndex(i);
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, paddingTop: spacing.sp8, backgroundColor: c.bg },
        topBar: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: spacing.sp5,
          minHeight: 32,
        },
        slide: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.sp7,
          gap: spacing.sp5,
        },
        /** Slides con demo: flex-column sin scroll. El demo ocupa el espacio
         *  sobrante despues del texto. Garantiza que no hay scroll vertical
         *  en ningun dispositivo soportado (UX-011). */
        slideWithDemo: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.sp5,
          paddingTop: spacing.sp3,
          paddingBottom: spacing.sp4,
          gap: spacing.sp4,
        },
        stepChip: {
          ...typography.overline,
          color: c.primary,
          fontWeight: "700",
          letterSpacing: 1,
        },
        title: {
          textAlign: "center",
          fontWeight: "800",
        },
        body: {
          ...typography.body,
          color: c.textSecondary,
          textAlign: "center",
          maxWidth: 480,
          lineHeight: 24,
        },
        dots: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          paddingVertical: spacing.sp4,
        },
        dot: { height: 8, borderRadius: 4 },
        cta: {
          padding: spacing.sp5,
          paddingBottom: spacing.sp7,
          gap: spacing.sp3,
        },
      }),
    [c],
  );

  return (
    <View style={styles.container}>
      {/* Back (izquierda) + Skip (derecha). Placeholder <View /> para mantener
           espacio cuando no hay elemento, asegurando que el layout sea simetrico. */}
      <View style={styles.topBar}>
        {index > 0 ? (
          <Link
            onPress={handleBack}
            accessibilityLabel="Volver al paso anterior"
          >
            Atras
          </Link>
        ) : (
          <View />
        )}
        {!isLastSlide ? (
          <Link
            block
            onPress={finishToLogin}
            accessibilityLabel={isPreview ? "Cerrar preview" : "Saltar introduccion"}
          >
            {isPreview ? "Cerrar preview" : "Saltar"}
          </Link>
        ) : (
          <View />
        )}
      </View>

      {/* Pager horizontal */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {WELCOME_SLIDES.map((slide, i) => {
          const hasDemo = DEMO_SLIDE_IDS.has(slide.id);

          // Contenido de texto comun a todos los slides
          const textContent = (
            <>
              <Text style={styles.stepChip}>{i + 1} de {totalSlides}</Text>
              <Heading level={1} style={styles.title}>{slide.title}</Heading>
              <Text style={styles.body}>{slide.body}</Text>
            </>
          );

          return (
            <View
              key={slide.id}
              style={{ width, flex: 1 }}
              // A11y: solo el slide activo vive en el accessibility tree.
              // Los inactivos siguen en el DOM para el scroll horizontal nativo,
              // pero VoiceOver/NVDA/TalkBack los ignoran completamente.
              // WCAG 2.2 AA: 1.3.1, 2.4.6, 4.1.2
              accessibilityElementsHidden={i !== index}
              importantForAccessibility={i === index ? "yes" : "no-hide-descendants"}
              aria-hidden={i !== index}
            >
              {hasDemo ? (
                /**
                 * Slides con demo: View flex:1 — el contenido se distribuye
                 * verticalmente sin overflow. El ScrollView fue reemplazado
                 * para garantizar que no haya scroll vertical (UX-011).
                 * Los demos fueron compactados para caber en pantallas pequenas.
                 */
                <View style={styles.slideWithDemo}>
                  {textContent}
                  {slide.id === "welcome-2" && (
                    <OnboardingEleccionesDemo
                      tipos={tipos2025}
                      activeIds={activeIds}
                      onToggle={handleToggleEleccion}
                    />
                  )}
                  {slide.id === "welcome-3" && <OnboardingPreguntaDemo />}
                  {slide.id === "welcome-4" && <OnboardingResultadosDemo />}
                </View>
              ) : (
                <View style={styles.slide}>
                  {textContent}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Indicadores */}
      <View style={styles.dots}>
        {WELCOME_SLIDES.map((slide, i) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? c.primary : c.border,
                width: i === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.cta}>
        {isLastSlide && FINAL_CTAS ? (
          <>
            <Button
              onPress={finishToRegister}
              accessibilityLabel={FINAL_CTAS.primary}
            >
              {FINAL_CTAS.primary}
            </Button>
            <Link
              block
              onPress={finishToLogin}
              accessibilityLabel={FINAL_CTAS.secondary}
            >
              {FINAL_CTAS.secondary}
            </Link>
            <Link
              block
              onPress={finishAsGuest}
              accessibilityLabel={FINAL_CTAS.tertiary}
            >
              {FINAL_CTAS.tertiary}
            </Link>
          </>
        ) : (
          <Button onPress={handleNext} accessibilityLabel="Siguiente">
            Siguiente
          </Button>
        )}
      </View>
    </View>
  );
}
