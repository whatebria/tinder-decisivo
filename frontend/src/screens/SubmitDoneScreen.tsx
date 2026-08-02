/**
 * SubmitDoneScreen: pantalla de confirmacion post-cuestionario.
 *
 * Dos modos:
 * - "eleccion" (default): user termino un cuestionario de eleccion especifica.
 *   CTA principal: "Ver mis matches" -> Resultados.
 * - "base": user termino el cuestionario de un TipoEleccion con es_base=true
 *   (Preguntas generales). Sus respuestas se aplican transversalmente al match
 *   de cualquier eleccion, pero el tipo base no tiene candidatos propios.
 *   CTA principal:
 *     - si hay al menos una eleccion especifica activa: "Ver mis matches en <nombre>" -> Resultados
 *     - si no: "Activar una eleccion" -> GestionElecciones
 *
 * Fixes aplicados:
 *   BUG-028: ScreenChrome -- SafeAreaView en todas las plataformas
 *   BUG-029: ctaLoading -- evita doble-press en handleCtaBase
 *   TASK-059: un unico return (DRY) + handlers con useCallback
 *   UX-057:  accessibilityLiveRegion="assertive" en Heading "Listo!"
 */

import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Heading, Link, ScreenChrome, useToast } from "../components";
import { useTiposEleccion } from "../api/hooks";
import { useElectionsPrefsStore } from "../store/electionsPrefs";
import { partitionTipos } from "../store/electionsPrefs";
import { useCuestionarioStore } from "../store/cuestionario";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import type { RootStackScreenProps } from "../navigation/types";

export function SubmitDoneScreen({
  route,
  navigation,
}: RootStackScreenProps<"SubmitDone">) {
  const mode = route.params?.mode ?? "eleccion";
  const c = useThemeColors();
  const toast = useToast();
  const reset = useCuestionarioStore((s) => s.reset);
  const setTipoEleccion = useCuestionarioStore((s) => s.setTipoEleccion);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const activeIds = useElectionsPrefsStore((s) => s.activeIds);

  // BUG-029: loading state para evitar doble-press en el CTA async.
  const [ctaLoading, setCtaLoading] = useState(false);

  const { data: tipos = [] } = useTiposEleccion();

  // Para modo "base": ubicar la primera eleccion especifica activa (si hay)
  // para poder llevar al user directo a sus matches enriquecidos.
  const primeraEspecificaActiva = useMemo(() => {
    if (mode !== "base") return null;
    const { activas } = partitionTipos(tipos, activeIds);
    return activas.find((t) => !t.es_base && t.id != null) ?? null;
  }, [mode, tipos, activeIds]);

  // TASK-059: handlers con useCallback para referencias estables.
  const handleVolver = useCallback(() => {
    reset();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }, [reset, navigation]);

  const handleCtaEleccion = useCallback(() => {
    navigation.replace("Resultados");
  }, [navigation]);

  const handleCtaBase = useCallback(async () => {
    setCtaLoading(true);
    try {
      if (primeraEspecificaActiva?.id != null) {
        setTipoEleccion(primeraEspecificaActiva.id);
        await loadForTipoEleccion(primeraEspecificaActiva.id);
        navigation.replace("Resultados");
      } else {
        navigation.replace("GestionElecciones");
      }
    } catch {
      // BUG-029: error informado al usuario; navegamos igual (Resultados hace su propio fetch).
      toast.error("No pudimos cargar todos los datos");
      navigation.replace("Resultados");
    } finally {
      setCtaLoading(false);
    }
  }, [primeraEspecificaActiva, setTipoEleccion, loadForTipoEleccion, navigation, toast]);

  // TASK-059: derivados compartidos -- un unico return (DRY).
  const isBase = mode === "base";

  const leadText = isBase
    ? "Guardamos tus respuestas generales."
    : "Guardamos tus respuestas.";

  const subtleText = isBase
    ? "Estas respuestas se aplican automaticamente al match de todas las elecciones que actives. Cuanto mas contestes, mas precisos son tus matches."
    : "Ahora puedes ver que candidatos coinciden mas con tu forma de pensar.";

  const ctaLabel = isBase
    ? (primeraEspecificaActiva
        ? `Ver mis matches en ${primeraEspecificaActiva.nombre}`
        : "Activar una eleccion")
    : "Ver mis matches";

  const onCta = isBase ? handleCtaBase : handleCtaEleccion;

  // BUG-028: ScreenChrome garantiza SafeAreaView en iOS notch + Android nav bar.
  return (
    <ScreenChrome edges={["top", "bottom"]}>
      <View style={styles.root}>
        {/* UX-057: accessibilityLiveRegion="assertive" -> VoiceOver/TalkBack anuncian
            el exito inmediatamente al llegar a la pantalla (WCAG 4.1.3). */}
        <Heading level={1} color={c.success} accessibilityLiveRegion="assertive">
          Listo!
        </Heading>
        <Text style={[styles.lead, { color: c.text }]}>{leadText}</Text>
        <Text style={[styles.subtle, { color: c.textSecondary }]}>{subtleText}</Text>
        <Button onPress={onCta} loading={ctaLoading} disabled={ctaLoading}>
          {ctaLabel}
        </Button>
        <Link block onPress={handleVolver}>
          Volver al inicio
        </Link>
      </View>
    </ScreenChrome>
  );
}

// Colores inyectados inline -- sin dependencia de c.* en el StyleSheet estatico.
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.sp6,
    gap: spacing.sp4,
  },
  lead: {
    ...typography.body,
    fontSize: 17,
  },
  subtle: {
    ...typography.body,
  },
});
