/**
 * OnboardingScreen: 3 slides que explican el concepto.
 *
 * Se muestra solo la primera vez que el user abre la app (flag persistido).
 * Al completar o saltar navega a Login.
 *
 * Layout: pager horizontal simple con ScrollView + indicadores + botones.
 */

import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../components";
import { TextButton } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useOnboardingStore } from "../store/onboarding";
import { useThemeColors } from "../theme/useTheme";

interface Slide {
  title: string;
  body: string;
  emoji: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "*",
    title: "Bienvenido a Tinder Decisivo",
    body: "Una app chilena para ayudarte a decidir tu voto informado. Sin propaganda, sin sesgos: solo tus valores comparados con las posturas reales de los candidatos.",
  },
  {
    emoji: "?",
    title: "Como funciona el match",
    body: "Respondes preguntas sobre temas concretos (economia, medio ambiente, seguridad, etc). Cada respuesta la comparamos con la postura publica de cada candidato. Puedes dar mas o menos peso a los temas que te importan.",
  },
  {
    emoji: "%",
    title: "Como calculamos tus resultados",
    body: "Sumamos los puntos de coincidencia y te mostramos un ranking con porcentajes. Tu perfil por eje tematico aparece en un grafico de radar. Todo transparente: puedes ver como se llego a cada numero.",
  },
];

export function OnboardingScreen({
  navigation,
}: RootStackScreenProps<"Onboarding">) {
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const palette = useThemeColors();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const width = Dimensions.get("window").width;

  async function finish() {
    await markSeen();
    // Ya no aparece mas: AppNavigator hara swap al Login stack automatico.
  }

  function handleNext() {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    } else {
      void finish();
    }
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) setIndex(i);
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* Skip button top-right */}
      <View style={styles.topBar}>
        <TextButton onPress={finish}>Saltar</TextButton>
      </View>

      {/* Pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.emojiBox, { backgroundColor: palette.primary }]}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>
              {slide.title}
            </Text>
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? palette.primary : palette.border,
                width: i === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Button onPress={handleNext}>
          {index === SLIDES.length - 1 ? "Empezar" : "Siguiente"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  emojiBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: { fontSize: 52, color: "#FFFFFF", fontWeight: "800" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 480,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 20,
  },
  dot: { height: 8, borderRadius: 4 },
  cta: { padding: 20, paddingBottom: 32 },
});
